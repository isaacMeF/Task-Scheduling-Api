import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const responseBody = this.formatException(exception);
    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private formatException(exception: unknown) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return this.buildResponse(exception.getStatus(), response);
    }

    const status = this.detectStatus(exception);
    const message = this.extractMessage(exception);
    return this.buildResponse(status, message);
  }

  private buildResponse(statusCode: number, message: unknown) {
    return typeof message === 'object'
      ? { ...message, statusCode, timestamp: new Date().toISOString() }
      : { statusCode, message, timestamp: new Date().toISOString() };
  }

  private detectStatus(exception: unknown): number {
    return exception instanceof Error && exception.message.includes('E11000')
      ? HttpStatus.CONFLICT
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractMessage(exception: unknown): string {
    return exception instanceof Error ? exception.message : 'Internal server error';
  }
}