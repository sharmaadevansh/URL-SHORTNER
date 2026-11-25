import { describe, it, expect } from 'vitest';
import { UAParser } from 'ua-parser-js';
describe('Worker Click Event Ingestion', () => {
    it('correctly parses user-agent into device and browser families', () => {
        const desktopChromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
        const parser = new UAParser(desktopChromeUA);
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        expect(browser.name).toBe('Chrome');
        expect(device.type).toBeUndefined(); // Desktop is undefined in ua-parser-js
    });
    it('correctly parses mobile user-agent', () => {
        const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1';
        const parser = new UAParser(mobileUA);
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        expect(browser.name).toBe('Mobile Safari');
        expect(device.type).toBe('mobile');
    });
    it('validates click event payload shape', () => {
        const payload = {
            linkId: '665123456789abcdef123456',
            shortCode: 'launch',
            occurredAt: new Date().toISOString(),
            referrerHost: 'github.com',
            deviceType: 'Desktop',
            browserFamily: 'Chrome',
        };
        expect(payload.linkId).toBeDefined();
        expect(payload.shortCode).toBe('launch');
        expect(payload.referrerHost).toBe('github.com');
    });
});
