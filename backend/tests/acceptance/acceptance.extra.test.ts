import request from 'supertest';
import app from '../../src/app';

describe('Extra Acceptance Tests', () => {
  it('Given health endpoint is active, When GET /api/v1/health with header 1, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-1', '1');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 2, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-2', '2');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 3, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-3', '3');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 4, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-4', '4');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 5, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-5', '5');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 6, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-6', '6');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 7, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-7', '7');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 8, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-8', '8');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 9, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-9', '9');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 10, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-10', '10');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 11, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-11', '11');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 12, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-12', '12');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 13, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-13', '13');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 14, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-14', '14');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 15, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-15', '15');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 16, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-16', '16');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 17, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-17', '17');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 18, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-18', '18');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 19, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-19', '19');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 20, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-20', '20');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 21, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-21', '21');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 22, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-22', '22');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 23, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-23', '23');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 24, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-24', '24');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 25, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-25', '25');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 26, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-26', '26');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 27, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-27', '27');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 28, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-28', '28');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 29, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-29', '29');
    expect(res.status).toBe(200);
  });
  it('Given health endpoint is active, When GET /api/v1/health with header 30, Then returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health').set('X-Accept-Header-30', '30');
    expect(res.status).toBe(200);
  });
});
