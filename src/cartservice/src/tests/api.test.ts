import { exec } from 'child_process';
import * as util from 'util';
const execAsync = util.promisify(exec);

import request from 'supertest';
import { app } from '../index'; // Assuming your express app is exported from index.ts

describe('Cart Service API', () => {
  it('should add an item to the cart', async () => {
    const response = await request(app)
      .post('/cart')
      .send({
        userId: 'test-user',
        item: {
          productId: 'product-123',
          quantity: 2,
        },
      });
    expect(response.status).toBe(201);
  });

  it("should get a user's cart", async () => {
    // First, add an item to the cart
    await request(app)
      .post('/cart')
      .send({
        userId: 'test-user-2',
        item: {
          productId: 'product-456',
          quantity: 1,
        },
      });

    const response = await request(app).get('/cart/test-user-2');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: 'test-user-2',
      items: [
        {
          productId: 'product-456',
          quantity: 1,
        },
      ],
    });
  });

  it("should empty a user's cart", async () => {
    // First, add an item to the cart
    await request(app)
      .post('/cart')
      .send({
        userId: 'test-user-3',
        item: {
          productId: 'product-789',
          quantity: 3,
        },
      });

    const deleteResponse = await request(app).delete('/cart/test-user-3');
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get('/cart/test-user-3');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.items).toEqual([]);
  });
});
