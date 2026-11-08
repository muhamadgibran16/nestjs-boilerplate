import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  path: string;
  timestamp: string;
}

/** Kode error Prisma yang dipetakan ke status HTTP. https://pris.ly/d/error-codes */
const PRISMA_ERROR_STATUS: Record<string, [number, string]> = {
  P2002: [HttpStatus.CONFLICT, 'Resource already exists'],
  P2025: [HttpStatus.NOT_FOUND, 'Resource not found'],
};

/** Menyeragamkan semua error response dan mencatat error tak terduga. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { statusCode, message, errors } = this.resolve(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `${req.method} ${req.originalUrl} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponse = {
      success: false,
      statusCode,
      message,
      ...(errors && { errors }),
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(body);
  }

  private resolve(exception: unknown): {
    statusCode: number;
    message: string;
    errors?: string[];
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return { statusCode, message: response };
      }
      const { message } = response as { message?: string | string[] };
      // ValidationPipe mengembalikan array pesan error.
      if (Array.isArray(message)) {
        return { statusCode, message: 'Validation failed', errors: message };
      }
      return { statusCode, message: message ?? exception.message };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_STATUS[exception.code];
      if (mapped) return { statusCode: mapped[0], message: mapped[1] };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
