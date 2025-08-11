import request from 'supertest';
import express from 'express';
import { app } from '../server'; // Assuming your express app is exported from server.ts

describe('Shipping Service API', () => {
  it('POST /quote - should return a shipping quote', async () => {
    const response = await request(app)
      .post('/quote')
      .send({
        address: {
          street_address: '1600 Amphitheatre Parkway',
          city: 'Mountain View',
          state: 'CA',
          country: 'USA',
          zip_code: 94043
        },
        items: [
          {
            product_id: 'OLJCESPC7Z',
            quantity: 1
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cost_usd');
    expect(response.body.cost_usd.currency_code).toBe('USD');
    expect(response.body.cost_usd.units).toBe(8);
    expect(response.body.cost_usd.nanos).toBe(990000000);
  });

  it('POST /shiporder - should return a tracking ID', async () => {
    const response = await request(app)
      .post('/shiporder')
      .send({
        address: {
          street_address: '1600 Amphitheatre Parkway',
          city: 'Mountain View',
          state: 'CA',
          country: 'USA',
          zip_code: 94043
        },
        items: [
          {
            product_id: 'OLJCESPC7Z',
            quantity: 1
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tracking_id');
    expect(typeof response.body.tracking_id).toBe('string');
    expect(response.body.tracking_id).toMatch(/^[A-Z]{2}-\d{10}-\d{5}$/);
  });
});