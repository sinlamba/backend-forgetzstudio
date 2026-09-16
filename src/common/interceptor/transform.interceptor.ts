import {
  NestInterceptor,
  ExecutionContext,
  Injectable,
  CallHandler,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor
  implements NestInterceptor
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ) {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {

        if (response.headersSent) {
          return data;
        }

        return instanceToPlain(data);
      }),
    );
  }
}