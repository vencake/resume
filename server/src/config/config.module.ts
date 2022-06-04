import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import Joi from 'joi';

import appConfig from './app.config';
import authConfig from './auth.config';
import databaseConfig from './database.config';
import googleConfig from './google.config';
import sendgridConfig from './sendgrid.config';
import storageConfig from './storage.config';

const validationSchema = Joi.object({
  // App
  TZ: Joi.string().default('UTC'),
  PORT: Joi.number().default(3100),
  SECRET_KEY: Joi.string().required(),
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),

  // URLs
  PUBLIC_URL: Joi.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: Joi.string(),
  POSTGRES_HOST: Joi.string(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string(),
  POSTGRES_USER: Joi.string(),
  POSTGRES_PASSWORD: Joi.string(),
  POSTGRES_SSL_CERT: Joi.string().allow(''),

  // Auth
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRY_TIME: Joi.number().required(),

  // Google
  GOOGLE_API_KEY: Joi.string().allow(''),
  GOOGLE_CLIENT_SECRET: Joi.string().allow(''),
  PUBLIC_GOOGLE_CLIENT_ID: Joi.string().allow(''),

  // SendGrid
  SENDGRID_API_KEY: Joi.string().allow(''),
  SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID: Joi.string().allow(''),
  SENDGRID_FROM_NAME: Joi.string().allow(''),
  SENDGRID_FROM_EMAIL: Joi.string().allow(''),

  // Storage
  STORAGE_BUCKET: Joi.string().allow(''),
  STORAGE_REGION: Joi.string().allow(''),
  STORAGE_ENDPOINT: Joi.string().allow(''),
  STORAGE_URL_PREFIX: Joi.string().allow(''),
  STORAGE_ACCESS_KEY: Joi.string().allow(''),
  STORAGE_SECRET_KEY: Joi.string().allow(''),
})
  .xor('DATABASE_URL', 'POSTGRES_HOST')
  .with('POSTGRES_HOST', ['POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']);

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [appConfig, authConfig, databaseConfig, googleConfig, sendgridConfig, storageConfig],
      validationSchema: validationSchema,
    }),
  ],
})
export class ConfigModule {}
