import request from 'supertest';
import app from './index';
import http from 'http';

describe('EmailService API', () => {
  let server: http.Server;

  beforeAll((done) => {
    server = app.listen(8081, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 for a valid request', async () => {
    const response = await request(server)
      .post('/send_order_confirmation')
      .send({
        email: 'test@example.com',
        order: {
          order_id: '123',
          shipping_tracking_id: 'abc',
          shipping_cost: {
            currency_code: 'USD',
            units: 10,
            nanos: 0,
          },
          shipping_address: {
            street_address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            country: 'USA',
            zip_code: 12345,
          },
          items: [
            {
              item: {
                product_id: 'product1',
                quantity: 1,
              },
              cost: {
                currency_code: 'USD',
                units: 10,
                nanos: 0,
              },
            },
          ],
        },
      });
    expect(response.status).toBe(200);
  });

  it('should return 400 for an invalid request', async () => {
    const response = await request(server)
      .post('/send_order_confirmation')
      .send({
        email: 'not-an-email',
      });
    expect(response.status).toBe(400);
  });
});
