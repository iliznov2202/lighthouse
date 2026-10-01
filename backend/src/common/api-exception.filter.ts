import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    let status = 500;
    let message: string | string[] = 'Internal server error';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message ?? error.message;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const mappings: Record<string, [number, string]> = {
        P2002: [409, 'Resource already exists'],
        P2003: [400, 'Invalid related resource'],
        P2025: [404, 'Resource not found'],
        P2034: [409, 'Concurrent update; retry the request'],
      };
      [status, message] = mappings[error.code] ?? [500, 'Internal server error'];
    } else if (error && typeof error === 'object' && 'type' in error) {
      const type = (error as { type: string }).type;
      if (type === 'entity.too.large') [status, message] = [413, 'Request body exceeds 32 KB'];
      if (type === 'entity.parse.failed') [status, message] = [400, 'Malformed JSON'];
    }
    // Prisma errors may embed query values. Never log raw errors/request bodies
    // because they can contain passwords, tokens and user data.
    if (status === 500) this.logger.error({ event: 'api.unhandled_error', errorType: error instanceof Error ? error.name : 'UnknownError', method: request.method });
    response.status(status).json({ statusCode: status, message, path: request.path, timestamp: new Date().toISOString() });
  }
}
