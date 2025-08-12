import request from 'supertest';
import app from '../src/index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Frontend API', () => {
  beforeEach(() => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/products')) {
        return Promise.resolve({ data: [{ id: '1', name: 'test product', picture: 'test.jpg', price_usd: { currency_code: 'USD', units: 10, nanos: 0 } }] });
      }
      if (url.includes('/currencies')) {
        return Promise.resolve({ data: ['USD', 'EUR'] });
      }
      if (url.includes('/cart')) {
        return Promise.resolve({ data: { items: [] } });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  it('should return 200 for GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('should return 200 for GET /product/:id', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: '1', name: 'test product' } });
    const res = await request(app).get('/product/1');
    expect(res.status).toBe(200);
  });

  it('should return 200 for GET /cart', async () => {
    const res = await request(app).get('/cart');
    expect(res.status).toBe(200);
  });

  it('should return 302 for POST /cart', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    const res = await request(app).post('/cart').send({ product_id: '1', quantity: 1 });
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/cart');
  });

  it('should return 302 for POST /cart/empty', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: {} });
    const res = await request(app).post('/cart/empty');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/');
  });

  it('should return 200 for POST /cart/checkout', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    const res = await request(app).post('/cart/checkout').send({
      email: 'test@test.com',
      street_address: '123 test st',
      zip_code: '12345',
      city: 'test city',
      state: 'ts',
      country: 'test country',
      credit_card_number: '1234567890123456',
      credit_card_expiration_month: 12,
      credit_card_expiration_year: 2025,
      credit_card_cvv: 123,
    });
    expect(res.status).toBe(200);
  });

  it('should return 302 for POST /setCurrency', async () => {
    const res = await request(app).post('/setCurrency').send({ currency_code: 'EUR' });
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('back');
  });

  it('should return 200 for GET /_healthz', async () => {
    const res = await request(app).get('/_healthz');
    expect(res.status).toBe(200);
  });
});
