"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderConfirmation = exports.chargeCard = exports.shipOrder = exports.getShippingQuote = exports.convertCurrency = exports.getProduct = exports.emptyCart = exports.getCart = void 0;
const axios_1 = __importDefault(require("axios"));
const { CART_SERVICE_ADDR = 'http://cartservice:7070', PRODUCT_CATALOG_SERVICE_ADDR = 'http://productcatalogservice:3550', SHIPPING_SERVICE_ADDR = 'http://shippingservice:50051', CURRENCY_SERVICE_ADDR = 'http://currencyservice:7000', PAYMENT_SERVICE_ADDR = 'http://paymentservice:50051', EMAIL_SERVICE_ADDR = 'http://emailservice:5000', } = process.env;
const getCart = async (userId) => {
    const response = await axios_1.default.get(`${CART_SERVICE_ADDR}/cart/${userId}`);
    return response.data.items;
};
exports.getCart = getCart;
const emptyCart = async (userId) => {
    await axios_1.default.delete(`${CART_SERVICE_ADDR}/cart/${userId}`);
};
exports.emptyCart = emptyCart;
const getProduct = async (productId) => {
    const response = await axios_1.default.get(`${PRODUCT_CATALOG_SERVICE_ADDR}/products/${productId}`);
    return response.data;
};
exports.getProduct = getProduct;
const convertCurrency = async (money, toCurrency) => {
    const response = await axios_1.default.post(`${CURRENCY_SERVICE_ADDR}/convert`, {
        from: money,
        to_code: toCurrency,
    });
    return response.data;
};
exports.convertCurrency = convertCurrency;
const getShippingQuote = async (address, items) => {
    const response = await axios_1.default.post(`${SHIPPING_SERVICE_ADDR}/getquote`, {
        address,
        items,
    });
    return response.data;
};
exports.getShippingQuote = getShippingQuote;
const shipOrder = async (address, items) => {
    const response = await axios_1.default.post(`${SHIPPING_SERVICE_ADDR}/ship`, {
        address,
        items,
    });
    return response.data.tracking_id;
};
exports.shipOrder = shipOrder;
const chargeCard = async (amount, creditCard) => {
    const response = await axios_1.default.post(`${PAYMENT_SERVICE_ADDR}/charge`, {
        amount,
        credit_card: creditCard,
    });
    return response.data.transaction_id;
};
exports.chargeCard = chargeCard;
const sendOrderConfirmation = async (email, order) => {
    await axios_1.default.post(`${EMAIL_SERVICE_ADDR}/send_order_confirmation`, {
        email,
        order,
    });
};
exports.sendOrderConfirmation = sendOrderConfirmation;
