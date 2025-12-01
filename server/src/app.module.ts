import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { ParentsModule } from './modules/parents/parents.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ProgressModule } from './modules/progress/progress.module';
import { BadgesModule } from './modules/badges/badges.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SeederModule } from './database/seeder.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], // Load .env.local first (for secrets), then .env
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    ParentsModule,
    TeachersModule,
    ActivitiesModule,
    ProgressModule,
    BadgesModule,
    AchievementsModule,
    ClassesModule,
    SeederModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
