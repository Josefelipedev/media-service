import { registerAs } from '@nestjs/config';

export default registerAs('validation', () => ({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
