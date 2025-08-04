import request from 'supertest';
import express from 'express';
import { Address, CreditCardInfo, PlaceOrderRequest } from './types';

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

import { app } from './index';
import {
  getCart,
  emptyCart,
  getProduct,
  convertCurrency,
  getShippingQuote,
  shipOrder,
  chargeCard,
  sendOrderConfirmation,
} from './dependencies';

describe('Checkout API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should place an order successfully', async () => {
    const mockAddress: Address = {
      street_address: '1600 Amphitheatre Parkway',
      city: 'Mountain View',
      state: 'CA',
      country: 'USA',
      zip_code: 94043,
    };

    const mockCreditCard: CreditCardInfo = {
      credit_card_number: '1234-5678-9012-3456',
      credit_card_cvv: 123,
      credit_card_expiration_year: 2030,
      credit_card_expiration_month: 1,
    };

    const mockRequest: PlaceOrderRequest = {
      user_id: 'test-user',
      user_currency: 'USD',
      address: mockAddress,
      email: 'test@example.com',
      credit_card: mockCreditCard,
    };

    // Mock dependency functions
    (getCart as jest.Mock).mockResolvedValue([
      { product_id: 'OLJCESPC7Z', quantity: 1 },
    ]);
    (emptyCart as jest.Mock).mockResolvedValue(undefined);
    (getProduct as jest.Mock).mockResolvedValue({
      id: 'OLJCESPC7Z',
      name: 'Vintage Typewriter',
      description: 'This typewriter is a thing of beauty.',
      picture: '/static/img/products/typewriter.jpg',
      price_usd: { currency_code: 'USD', units: 67, nanos: 990000000 },
      categories: ['vintage'],
    });
    (convertCurrency as jest.Mock).mockImplementation((money, toCurrency) =>
      Promise.resolve(money)
    );
    (getShippingQuote as jest.Mock).mockResolvedValue({
      cost_usd: { currency_code: 'USD', units: 10, nanos: 0 },
    });
    (shipOrder as jest.Mock).mockResolvedValue('test-tracking-id');
    (chargeCard as jest.Mock).mockResolvedValue('test-transaction-id');
    (sendOrderConfirmation as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post('/placeorder')
      .send(mockRequest);

    expect(response.status).toBe(200);
    expect(response.body.order).toBeDefined();
    expect(response.body.order.shipping_tracking_id).toBe('test-tracking-id');
    expect(response.body.order.items.length).toBe(1);
    expect(response.body.order.items[0].item.product_id).toBe('OLJCESPC7Z');
  });

  it('should return 400 for a bad request', async () => {
    const response = await request(app).post('/placeorder').send({});
    expect(response.status).toBe(400);
  });

  it('should return 500 if cart service fails', async () => {
    const mockRequest: PlaceOrderRequest = {
      user_id: 'test-user',
      user_currency: 'USD',
      address: { street_address: '123 Main St', city: 'Anytown', state: 'CA', country: 'USA', zip_code: 12345 },
      email: 'test@example.com',
      credit_card: { credit_card_number: '1111222233334444', credit_card_cvv: 123, credit_card_expiration_year: 2030, credit_card_expiration_month: 1 },
    };
    (getCart as jest.Mock).mockRejectedValue(new Error('Cart service error'));
    const response = await request(app)
      .post('/placeorder')
      .send(mockRequest);
    expect(response.status).toBe(500);
  });
});
