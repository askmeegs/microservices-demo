"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('API Server', () => {
    let app;
    beforeAll(() => {
        app = new index_1.App().app;
    });
    it('should return 200 for GET /healthz', async () => {
        const res = await (0, supertest_1.default)(app).get('/healthz');
        expect(res.status).toBe(200);
    });
    it('should return 200 for POST /charge with valid data', async () => {
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('/cart/')) {
                return Promise.resolve({
                    data: {
                        items: [{ product_id: '1', quantity: 1 }],
                    },
                });
            }
            if (url.includes('/products/')) {
                return Promise.resolve({
                    data: {
                        priceUsd: { currency_code: 'USD', units: 10, nanos: 0 },
                    },
                });
            }
            return Promise.reject(new Error('not found'));
        });
        mockedAxios.post.mockImplementation((url, data) => {
            if (url.includes('/convert')) {
                return Promise.resolve({
                    data: { currency_code: 'USD', units: 10, nanos: 0 },
                });
            }
            if (url.includes('/quote')) {
                return Promise.resolve({
                    data: {
                        cost_usd: { currency_code: 'USD', units: 5, nanos: 0 },
                    },
                });
            }
            if (url.includes('/charge')) {
                return Promise.resolve({
                    data: { transaction_id: '123' },
                });
            }
            if (url.includes('/shiporder')) {
                return Promise.resolve({
                    data: { tracking_id: 'abc' },
                });
            }
            if (url.includes('/send_order_confirmation')) {
                return Promise.resolve({});
            }
            return Promise.reject(new Error('not found'));
        });
        mockedAxios.delete.mockResolvedValue({});
        const res = await (0, supertest_1.default)(app)
            .post('/charge')
            .send({
            user_id: 'test-user',
            user_currency: 'USD',
            address: {
                street_address: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                country: 'USA',
                zip_code: 12345,
            },
            email: 'test@example.com',
            credit_card: {
                credit_card_number: '4000 0000 0000 0000',
                credit_card_cvv: 123,
                credit_card_expiration_year: 2030,
                credit_card_expiration_month: 12,
            },
        });
        expect(res.status).toBe(200);
        expect(res.body.order.order_id).toBeDefined();
        expect(res.body.order.shipping_tracking_id).toBe('abc');
    });
    it('should return 400 for POST /charge with invalid data', async () => {
        const res = await (0, supertest_1.default)(app).post('/charge').send({});
        expect(res.status).toBe(400);
    });
});
