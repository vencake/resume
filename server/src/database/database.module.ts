import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resume } from '@/resume/entities/resume.entity';
import { User } from '@/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url:
          configService.get<string>('postgres.url') ||
          `postgres://${configService.get<string>('postgres.username')}:${configService.get<string>(
            'postgres.password'
          )}@${configService.get<string>('postgres.host')}:${configService.get<number>(
            'postgres.port'
          )}/${configService.get<string>('postgres.database')}`,
        synchronize: true,
        entities: [User, Resume],
        ssl: configService.get<string>('postgres.certificate') && {
          ca: Buffer.from(configService.get<string>('postgres.certificate'), 'base64').toString('ascii'),
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
