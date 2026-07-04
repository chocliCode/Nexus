import request from 'supertest';
import app from '../src/app';

describe('Extra Integration Tests for GET /api/v1/health', () => {
  it('should return 200 with no query params', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
  });

  it('should return 200 with query param a=1', async () => {
    const res = await request(app).get('/api/v1/health?a=1');
    expect(res.status).toBe(200);
  });

  it('should return 200 with query param b=2', async () => {
    const res = await request(app).get('/api/v1/health?b=2');
    expect(res.status).toBe(200);
  });

  it('should return 200 with query param c=3', async () => {
    const res = await request(app).get('/api/v1/health?c=3');
    expect(res.status).toBe(200);
  });

  it('should return 200 with query param test=true', async () => {
    const res = await request(app).get('/api/v1/health?test=true');
    expect(res.status).toBe(200);
  });

  it('should return 200 with multiple query params', async () => {
    const res = await request(app).get('/api/v1/health?param1=val1&param2=val2');
    expect(res.status).toBe(200);
  });

  it('should return 200 with query param special characters', async () => {
    const res = await request(app).get('/api/v1/health?key=value@123');
    expect(res.status).toBe(200);
  });

  it('should return 200 with very long query param', async () => {
    const longStr = 'a'.repeat(100);
    const res = await request(app).get(`/api/v1/health?long=${longStr}`);
    expect(res.status).toBe(200);
  });

  it('should return 200 with query param missing value', async () => {
    const res = await request(app).get('/api/v1/health?key=');
    expect(res.status).toBe(200);
  });
});
