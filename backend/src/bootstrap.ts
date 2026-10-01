import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { Express, Request, Response, NextFunction } from 'express';

export function configureApp(app: NestExpressApplication) {
  const config = app.get(ConfigService);
  const production = config.get<string>('NODE_ENV') === 'production';
  const express = app.getHttpAdapter().getInstance() as Express;
  const trustProxy = config.getOrThrow<string>('TRUST_PROXY');
  express.set('trust proxy', trustProxy === '1' ? 1 : trustProxy === 'loopback' ? 'loopback' : false);
  express.disable('x-powered-by');
  app.use(helmet({ strictTransportSecurity: production ? { maxAge: 31536000, includeSubDomains: true } : false }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (/^\/(auth|users)(\/|$)/.test(request.path)) response.setHeader('Cache-Control', 'no-store');
    if (production && !request.secure) {
      response.status(400).json({ statusCode: 400, message: 'HTTPS required', path: request.path, timestamp: new Date().toISOString() });
      return;
    }
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.headers['content-type'] && !request.is('application/json')) {
      response.status(415).json({ statusCode: 415, message: 'Only application/json is supported; uploads are disabled', path: request.path, timestamp: new Date().toISOString() });
      return;
    }
    next();
  });
  app.enableCors({ origin: config.getOrThrow<string>('FRONTEND_ORIGINS').split(',').map(origin => origin.trim()), methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] });
  // File uploads have no route or multipart parser at this stage.
  app.useBodyParser('json', { limit: '32kb' });
  if (production) return; // API documentation is local-only by default.
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Маяк API').setDescription('Authentication, users, schools and classes').setVersion('0.1.0').addBearerAuth().build());
  SwaggerModule.setup('docs', app, document);
}
