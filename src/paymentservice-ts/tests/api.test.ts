import request from 'supertest';
import app from '../src/index'; // Assuming your express app is exported from index.ts

describe('API Server', () => {
  let server: any;

  beforeAll((done) => {
    server = app.listen(0, () => {
      console.log('Test server running on a random port');
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /healthz', () => {
    it('should return 200 OK', async () => {
      const res = await request(server).get('/healthz');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ status: 'SERVING' });
    });
  });

  describe('POST /charge', () => {
    it('should return 200 OK for a valid charge request', async () => {
      const chargeRequest = {
        amount: {
          currency_code: 'USD',
          units: 100,
          nanos: 0,
        },
        credit_card: {
          credit_card_number: '4000 0000 0000 0000',
          credit_card_cvv: 123,
          credit_card_expiration_year: 2030,
          credit_card_expiration_month: 12,
        },
      };
      const res = await request(server).post('/charge').send(chargeRequest);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transaction_id');
    });

    it('should return 400 Bad Request for a missing request body', async () => {
      const res = await request(server).post('/charge').send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 Bad Request for an invalid request body', async () => {
        const chargeRequest = {
            amount: {
                currency_code: 'USD',
                units: 100,
                nanos: 0,
            }
            // Missing credit_card
        };
        const res = await request(server).post('/charge').send(chargeRequest);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
      });
  });
});
