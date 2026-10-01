import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  configureApp(app);
  const config = app.get(ConfigService);
  await app.listen(config.getOrThrow<number>('PORT'), config.getOrThrow<string>('HOST'));
}
void bootstrap().catch(() => { console.error('Backend startup failed. Check configuration and PostgreSQL availability.'); process.exitCode = 1; });
