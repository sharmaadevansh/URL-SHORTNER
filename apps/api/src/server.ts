import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/connection.js';
import { cacheService } from './infrastructure/cache/redis.js';
import { eventPublisher } from './infrastructure/queue/eventPublisher.js';
import { logger } from './observability/logger.js';

async function bootstrap() {
  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: config.env,
          publicUrl: config.publicAppUrl,
        },
        `LinkForge API Server listening on port ${config.port}`
      );
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Initiating graceful shutdown...');

      server.close(async () => {
        logger.info('HTTP server closed');
        await cacheService.quit();
        await eventPublisher.quit();
        await disconnectDatabase();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force exit if shutdown takes longer than 10 seconds
      setTimeout(() => {
        logger.error('Shutdown timed out, force quitting');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ error }, 'Fatal error during server startup');
    process.exit(1);
  }
}

bootstrap();
