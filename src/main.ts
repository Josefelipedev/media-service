import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Ou use '*' para permitir tudo
    credentials: false,
  });
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3008);
}
bootstrap();
