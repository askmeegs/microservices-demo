import request from 'supertest';
import app from './server';

describe('Product Catalog Service', () => {
  it('should list all products', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a product by id', async () => {
    const res = await request(app).get('/products/66VCHSJNUP');
    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual('66VCHSJNUP');
  });

  it('should return 404 for a non-existent product', async () => {
    const res = await request(app).get('/products/NONEXISTENT');
    expect(res.status).toEqual(404);
  });

  it('should search for products', async () => {
    const res = await request(app).get('/products/search').query({ query: 'tank' });
    expect(res.status).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
