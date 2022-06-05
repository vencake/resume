import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  timezone: process.env.TZ,
  environment: process.env.NODE_ENV,
  secretKey: process.env.SECRET_KEY,
  port: 3100,
  url: process.env.PUBLIC_URL || 'http://localhost:3000',
}));
