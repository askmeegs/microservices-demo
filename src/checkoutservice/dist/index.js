"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const dependencies_1 = require("./dependencies");
const money_1 = require("./money");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.post('/placeorder', async (req, res) => {
    console.log(`[PlaceOrder] user_id=${req.body.user_id} user_currency=${req.body.user_currency}`);
    try {
        const request = req.body;
        if (!request.user_id ||
            !request.user_currency ||
            !request.address ||
            !request.email ||
            !request.credit_card) {
            return res.status(400).send('Bad request');
        }
        const orderId = (0, uuid_1.v4)();
        const cartItems = await (0, dependencies_1.getCart)(request.user_id);
        if (cartItems.length === 0) {
            return res.status(400).send('Cart is empty');
        }
        const orderItems = await Promise.all(cartItems.map(async (item) => {
            const product = await (0, dependencies_1.getProduct)(item.product_id);
            if (!product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }
            const price = await (0, dependencies_1.convertCurrency)(product.price_usd, request.user_currency);
            return {
                item,
                cost: price,
            };
        }));
        const shippingCost = await (0, dependencies_1.getShippingQuote)(request.address, cartItems);
        const shippingPrice = await (0, dependencies_1.convertCurrency)(shippingCost.cost_usd, request.user_currency);
        let total = {
            currency_code: request.user_currency,
            units: 0,
            nanos: 0,
        };
        total = (0, money_1.sum)(total, shippingPrice);
        for (const item of orderItems) {
            total = (0, money_1.sum)(total, (0, money_1.multiply)(item.cost, item.item.quantity));
        }
        const transactionId = await (0, dependencies_1.chargeCard)(total, request.credit_card);
        console.log(`payment went through (transaction_id: ${transactionId})`);
        const trackingId = await (0, dependencies_1.shipOrder)(request.address, cartItems);
        await (0, dependencies_1.emptyCart)(request.user_id);
        const orderResult = {
            order_id: orderId,
            shipping_tracking_id: trackingId,
            shipping_cost: shippingPrice,
            shipping_address: request.address,
            items: orderItems,
        };
        await (0, dependencies_1.sendOrderConfirmation)(request.email, orderResult);
        console.log(`order confirmation email sent to ${request.email}`);
        const response = {
            order: orderResult,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});
if (process.env.NODE_ENV !== 'test') {
    exports.app.listen(8080, () => {
        console.log('Server is running on port 8080');
    });
}
