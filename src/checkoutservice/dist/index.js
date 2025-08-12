"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class App {
    app;
    productCatalogSvcAddr;
    cartSvcAddr;
    currencySvcAddr;
    shippingSvcAddr;
    paymentSvcAddr;
    emailSvcAddr;
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use(express_1.default.json());
        this.routes();
        this.productCatalogSvcAddr = process.env.PRODUCT_CATALOG_SERVICE_ADDR || 'http://localhost:3550';
        this.cartSvcAddr = process.env.CART_SERVICE_ADDR || 'http://localhost:7070';
        this.currencySvcAddr = process.env.CURRENCY_SERVICE_ADDR || 'http://localhost:7000';
        this.shippingSvcAddr = process.env.SHIPPING_SERVICE_ADDR || 'http://localhost:50051';
        this.paymentSvcAddr = process.env.PAYMENT_SERVICE_ADDR || 'http://localhost:50051';
        this.emailSvcAddr = process.env.EMAIL_SERVICE_ADDR || 'http://localhost:5000';
    }
    routes() {
        this.app.get('/healthz', (req, res) => {
            res.status(200).send('OK');
        });
        this.app.post('/charge', async (req, res) => {
            try {
                const { user_id, user_currency, address, email, credit_card } = req.body;
                if (!user_id || !user_currency || !address || !email || !credit_card) {
                    return res.status(400).send('Bad Request');
                }
                const orderId = (0, uuid_1.v4)();
                // Get cart
                const { data: cart } = await axios_1.default.get(`${this.cartSvcAddr}/cart/${user_id}`);
                const cartItems = cart.items;
                // Prepare order items
                const orderItems = await Promise.all(cartItems.map(async (item) => {
                    const { data: product } = await axios_1.default.get(`${this.productCatalogSvcAddr}/products/${item.product_id}`);
                    const { data: price } = await axios_1.default.post(`${this.currencySvcAddr}/convert`, {
                        from: product.priceUsd,
                        toCode: user_currency,
                    });
                    return {
                        item,
                        cost: price,
                    };
                }));
                // Get shipping quote
                const { data: shippingQuote } = await axios_1.default.post(`${this.shippingSvcAddr}/quote`, {
                    address,
                    items: cartItems,
                });
                const shippingCost = shippingQuote.cost_usd;
                // Calculate total cost
                let totalCost = { currency_code: user_currency, units: 0, nanos: 0 };
                totalCost.units += shippingCost.units;
                totalCost.nanos += shippingCost.nanos;
                for (const orderItem of orderItems) {
                    totalCost.units += orderItem.cost.units * orderItem.item.quantity;
                    totalCost.nanos += orderItem.cost.nanos * orderItem.item.quantity;
                }
                // Charge card
                const { data: chargeResponse } = await axios_1.default.post(`${this.paymentSvcAddr}/charge`, {
                    amount: totalCost,
                    credit_card,
                });
                const transactionId = chargeResponse.transaction_id;
                // Ship order
                const { data: shipResponse } = await axios_1.default.post(`${this.shippingSvcAddr}/shiporder`, {
                    address,
                    items: cartItems,
                });
                const trackingId = shipResponse.tracking_id;
                // Empty cart
                await axios_1.default.delete(`${this.cartSvcAddr}/cart/${user_id}`);
                // Send order confirmation
                const orderResult = {
                    order_id: orderId,
                    shipping_tracking_id: trackingId,
                    shipping_cost: shippingCost,
                    shipping_address: address,
                    items: orderItems,
                };
                await axios_1.default.post(`${this.emailSvcAddr}/send_order_confirmation`, {
                    email,
                    order: orderResult,
                });
                res.status(200).json({ order: orderResult });
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });
    }
}
exports.App = App;
