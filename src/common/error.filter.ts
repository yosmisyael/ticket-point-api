import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        error: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        error: exception.message,
      });
    } else {
      response.status(500).json({
        error: 'An unknown error occurred.',
      });
    }
  }
}
