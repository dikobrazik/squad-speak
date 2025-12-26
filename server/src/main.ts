import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TelegramService } from './telegram/telegram.service';

import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const isDev = configService.get('IS_DEV') === 'true';

  app.enableCors({
    origin: isDev
      ? ['http://localhost:3000', 'http://192.168.31.146:3000']
      : ['https://squadspeak.ru', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    // allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Cookie'],
  });

  app.setGlobalPrefix('api', {
    exclude: [],
  });

  app.use(cookieParser());

  app.use(await app.get(TelegramService).createBot());

  await app.listen(80);
}

bootstrap();
