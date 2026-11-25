import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import pino from 'pino';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
});
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linkforge';
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// Define schemas in worker
const clickEventSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    shortCode: { type: String, required: true, index: true },
    occurredAt: { type: Date, default: Date.now, index: true },
    referrerHost: { type: String, default: null },
    deviceType: { type: String, default: null },
    browserFamily: { type: String, default: null },
    countryCode: { type: String, default: null },
}, { timestamps: false });
const linkSchema = new mongoose.Schema({
    totalClicks: { type: Number, default: 0 },
}, { timestamps: true });
const ClickEvent = mongoose.model('ClickEvent', clickEventSchema);
const Link = mongoose.model('Link', linkSchema);
let isRunning = true;
let redisClient = null;
async function processEvent(raw) {
    try {
        const data = JSON.parse(raw);
        const { linkId, shortCode, occurredAt, referrerHost, deviceType, browserFamily, countryCode } = data;
        if (!linkId || !shortCode) {
            logger.warn({ data }, 'Malformed click event, dropping');
            return;
        }
        await ClickEvent.create({
            linkId: new mongoose.Types.ObjectId(linkId),
            shortCode,
            occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
            referrerHost: referrerHost || 'Direct',
            deviceType: deviceType || 'Desktop',
            browserFamily: browserFamily || 'Other',
            countryCode: countryCode || null,
        });
        await Link.findByIdAndUpdate(linkId, {
            $inc: { totalClicks: 1 },
        });
        logger.debug({ shortCode, linkId }, 'Processed click event successfully');
    }
    catch (err) {
        logger.error({ error: err, raw }, 'Error processing click event');
    }
}
async function startWorker() {
    logger.info('Starting LinkForge Analytics Worker...');
    try {
        await mongoose.connect(mongoUri);
        logger.info('Worker connected to MongoDB');
    }
    catch (err) {
        logger.error({ error: err }, 'Worker failed to connect to MongoDB');
        process.exit(1);
    }
    redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => Math.min(times * 500, 3000),
    });
    redisClient.on('connect', () => {
        logger.info('Worker connected to Redis');
    });
    redisClient.on('error', (err) => {
        logger.warn({ error: err.message }, 'Worker Redis error');
    });
    logger.info('Worker loop active. Polling queue: linkforge:queue:clicks');
    while (isRunning) {
        try {
            if (redisClient.status !== 'ready') {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
            }
            // BRPOP blocks up to 5 seconds waiting for a new click event
            const result = await redisClient.brpop('linkforge:queue:clicks', 5);
            if (result && result.length === 2) {
                const [, message] = result;
                await processEvent(message);
            }
        }
        catch (err) {
            if (!isRunning)
                break;
            logger.error({ error: err.message }, 'Error in worker loop, retrying in 2s');
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
    logger.info('Worker loop stopped');
}
async function shutdown(signal) {
    logger.info({ signal }, 'Stopping worker gracefully...');
    isRunning = false;
    if (redisClient) {
        try {
            await redisClient.quit();
        }
        catch { }
    }
    await mongoose.disconnect();
    logger.info('Worker shutdown complete');
    process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
startWorker();
