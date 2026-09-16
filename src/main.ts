import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { sdk } from './common/langfuse/instrumentation';
import {clerkMiddleware} from "@clerk/express"
async function bootstrap() {
  sdk.start();
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000'],
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.use(clerkMiddleware())
  const port = Number(process.env.PORT);
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
