import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', ''),
  database: configService.get('DB_NAME', 'lingoshid'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // Enable synchronize for initial setup (creates tables automatically)
  // Set TYPEORM_SYNC=false in production after initial deployment
  synchronize: configService.get('TYPEORM_SYNC', 'true') === 'true',
  logging: configService.get('NODE_ENV') === 'development',
});