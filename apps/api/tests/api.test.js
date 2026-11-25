import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { UserModel, LinkModel } from '../src/infrastructure/database/models/index.js';
import { cacheService } from '../src/infrastructure/cache/redis.js';
const app = createApp();
describe('LinkForge API Test Suite', () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    let authToken = '';
    let userId = '';
    let testLinkId = '';
    let testShortCode = '';
    beforeAll(async () => {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linkforge_test';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }
        // Clean up any previous test artifacts
        await UserModel.deleteMany({ email: { $regex: /^test_/ } });
    });
    afterAll(async () => {
        // Clean up
        if (userId) {
            await LinkModel.deleteMany({ ownerId: userId });
            await UserModel.findByIdAndDelete(userId);
        }
        await cacheService.quit();
        await mongoose.disconnect();
    });
    describe('Health Check Endpoints', () => {
        it('GET /health/live returns 200 ok', async () => {
            const res = await request(app).get('/health/live');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
        });
        it('GET /health/ready returns ready status', async () => {
            const res = await request(app).get('/health/ready');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ready');
            expect(res.body.database).toBe('connected');
        });
    });
    describe('Authentication Flow', () => {
        it('POST /api/v1/auth/register registers a new user', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test Engineer',
                email: testEmail,
                password: testPassword,
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(testEmail);
            expect(res.body.data.accessToken).toBeDefined();
            authToken = res.body.data.accessToken;
            userId = res.body.data.user.id;
        });
        it('POST /api/v1/auth/register rejects duplicate email', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Duplicate Engineer',
                email: testEmail,
                password: testPassword,
            });
            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
        it('POST /api/v1/auth/login succeeds with valid credentials', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: testEmail,
                password: testPassword,
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
        });
        it('POST /api/v1/auth/login fails with invalid password', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: testEmail,
                password: 'WrongPassword!',
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('GET /api/v1/auth/me returns current user info', async () => {
            const res = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(userId);
        });
    });
    describe('Link Management Flow', () => {
        it('POST /api/v1/links creates a shortened link', async () => {
            const res = await request(app)
                .post('/api/v1/links')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                originalUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
                title: 'MDN Web Docs',
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.shortCode).toHaveLength(7);
            expect(res.body.data.originalUrl).toBe('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
            testLinkId = res.body.data.id;
            testShortCode = res.body.data.shortCode;
        });
        it('POST /api/v1/links rejects dangerous schemes like javascript:', async () => {
            const res = await request(app)
                .post('/api/v1/links')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                originalUrl: 'javascript:alert(1)',
                title: 'XSS attempt',
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
        it('POST /api/v1/links allows custom alias', async () => {
            const alias = `custom-${Date.now()}`;
            const res = await request(app)
                .post('/api/v1/links')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                originalUrl: 'https://nodejs.org',
                title: 'NodeJS',
                customAlias: alias,
            });
            expect(res.status).toBe(201);
            expect(res.body.data.shortCode).toBe(alias);
        });
        it('POST /api/v1/links rejects reserved aliases', async () => {
            const res = await request(app)
                .post('/api/v1/links')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                originalUrl: 'https://example.com',
                customAlias: 'api',
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
        it('GET /api/v1/links lists user links', async () => {
            const res = await request(app)
                .get('/api/v1/links')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
        });
        it('GET /api/v1/links/:id retrieves link by ID', async () => {
            const res = await request(app)
                .get(`/api/v1/links/${testLinkId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(testLinkId);
        });
        it('PATCH /api/v1/links/:id updates link details', async () => {
            const res = await request(app)
                .patch(`/api/v1/links/${testLinkId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                title: 'MDN Web Docs Updated',
            });
            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('MDN Web Docs Updated');
        });
        it('PATCH /api/v1/links/:id/status disables the link', async () => {
            const res = await request(app)
                .patch(`/api/v1/links/${testLinkId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'disabled' });
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('disabled');
        });
        it('GET /:code returns 404 for disabled link', async () => {
            const res = await request(app).get(`/${testShortCode}`);
            expect(res.status).toBe(404);
        });
        it('PATCH /api/v1/links/:id/status re-enables the link', async () => {
            const res = await request(app)
                .patch(`/api/v1/links/${testLinkId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'active' });
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('active');
        });
    });
    describe('Redirect Resolution Flow', () => {
        it('GET /:code redirects with 302 to original destination', async () => {
            const res = await request(app).get(`/${testShortCode}`);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
        });
        it('GET /:code works on cache hit path', async () => {
            // Second request should hit cache
            const res = await request(app).get(`/${testShortCode}`);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
        });
        it('GET /:code returns 404 for nonexistent code', async () => {
            const res = await request(app).get('/nonexistent_code_999');
            expect(res.status).toBe(404);
        });
    });
    describe('Analytics Endpoint', () => {
        it('GET /api/v1/links/:id/analytics retrieves link analytics', async () => {
            const res = await request(app)
                .get(`/api/v1/links/${testLinkId}/analytics?range=7d`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.timeSeries).toBeDefined();
            expect(Array.isArray(res.body.data.timeSeries)).toBe(true);
        });
        it('GET /api/v1/analytics/overview returns account level statistics', async () => {
            const res = await request(app)
                .get('/api/v1/analytics/overview')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalLinks).toBeGreaterThanOrEqual(1);
        });
    });
    describe('Link Deletion', () => {
        it('DELETE /api/v1/links/:id deletes the link', async () => {
            const res = await request(app)
                .delete(`/api/v1/links/${testLinkId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const check = await request(app).get(`/${testShortCode}`);
            expect(check.status).toBe(404);
        });
    });
});
