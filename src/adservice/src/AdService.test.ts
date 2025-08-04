import request from 'supertest';
import app from './index';

describe('AdService API', () => {
  it('should return random ads when no context_keys are provided', async () => {
    const response = await request(app).get('/ads');
    expect(response.status).toBe(200);
    expect(response.body.ads).toBeInstanceOf(Array);
    expect(response.body.ads.length).toBe(2);
  });

  it('should return ads for a single context key', async () => {
    const response = await request(app).get('/ads?context_keys=clothing');
    expect(response.status).toBe(200);
    expect(response.body.ads).toBeInstanceOf(Array);
    expect(response.body.ads.length).toBe(1);
    expect(response.body.ads[0].text).toContain('Tank top for sale');
  });

  it('should return ads for multiple context keys', async () => {
    const response = await request(app).get('/ads?context_keys=clothing&context_keys=accessories');
    expect(response.status).toBe(200);
    expect(response.body.ads).toBeInstanceOf(Array);
    expect(response.body.ads.length).toBe(2);
  });

  it('should return random ads for an unknown context key', async () => {
    const response = await request(app).get('/ads?context_keys=unknown');
    expect(response.status).toBe(200);
    expect(response.body.ads).toBeInstanceOf(Array);
    expect(response.body.ads.length).toBe(2);
  });
});