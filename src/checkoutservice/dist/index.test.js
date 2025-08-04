"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
// Mock the dependencies
jest.mock('./dependencies', () => ({
    getCart: jest.fn(),
    emptyCart: jest.fn(),
    getProduct: jest.fn(),
    convertCurrency: jest.fn(),
    getShippingQuote: jest.fn(),
    shipOrder: jest.fn(),
    chargeCard: jest.fn(),
    sendOrderConfirmation: jest.fn(),
}));
const index_1 = require("./index");
const dependencies_1 = require("./dependencies");
describe('Checkout API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should place an order successfully', async () => {
        const mockAddress = {
            street_address: '1600 Amphitheatre Parkway',
            city: 'Mountain View',
            state: 'CA',
            country: 'USA',
            zip_code: 94043,
        };
        const mockCreditCard = {
            credit_card_number: '1234-5678-9012-3456',
            credit_card_cvv: 123,
            credit_card_expiration_year: 2030,
            credit_card_expiration_month: 1,
        };
        const mockRequest = {
            user_id: 'test-user',
            user_currency: 'USD',
            address: mockAddress,
            email: 'test@example.com',
            credit_card: mockCreditCard,
        };
        // Mock dependency functions
        dependencies_1.getCart.mockResolvedValue([
            { product_id: 'OLJCESPC7Z', quantity: 1 },
        ]);
        dependencies_1.emptyCart.mockResolvedValue(undefined);
        dependencies_1.getProduct.mockResolvedValue({
            id: 'OLJCESPC7Z',
            name: 'Vintage Typewriter',
            description: 'This typewriter is a thing of beauty.',
            picture: '/static/img/products/typewriter.jpg',
            price_usd: { currency_code: 'USD', units: 67, nanos: 990000000 },
            categories: ['vintage'],
        });
        dependencies_1.convertCurrency.mockImplementation((money, toCurrency) => Promise.resolve(money));
        dependencies_1.getShippingQuote.mockResolvedValue({
            cost_usd: { currency_code: 'USD', units: 10, nanos: 0 },
        });
        dependencies_1.shipOrder.mockResolvedValue('test-tracking-id');
        dependencies_1.chargeCard.mockResolvedValue('test-transaction-id');
        dependencies_1.sendOrderConfirmation.mockResolvedValue(undefined);
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/placeorder')
            .send(mockRequest);
        expect(response.status).toBe(200);
        expect(response.body.order).toBeDefined();
        expect(response.body.order.shipping_tracking_id).toBe('test-tracking-id');
        expect(response.body.order.items.length).toBe(1);
        expect(response.body.order.items[0].item.product_id).toBe('OLJCESPC7Z');
    });
    it('should return 400 for a bad request', async () => {
        const response = await (0, supertest_1.default)(index_1.app).post('/placeorder').send({});
        expect(response.status).toBe(400);
    });
    it('should return 500 if cart service fails', async () => {
        const mockRequest = {
            user_id: 'test-user',
            user_currency: 'USD',
            address: { street_address: '123 Main St', city: 'Anytown', state: 'CA', country: 'USA', zip_code: 12345 },
            email: 'test@example.com',
            credit_card: { credit_card_number: '1111222233334444', credit_card_cvv: 123, credit_card_expiration_year: 2030, credit_card_expiration_month: 1 },
        };
        dependencies_1.getCart.mockRejectedValue(new Error('Cart service error'));
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/placeorder')
            .send(mockRequest);
        expect(response.status).toBe(500);
    });
});
