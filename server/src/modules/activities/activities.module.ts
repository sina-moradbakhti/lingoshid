import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from '../../entities/activity.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';
import { ActivitySession } from '../../entities/activity-session.entity';
import { Student } from '../../entities/student.entity';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityCompletion, ActivitySession, Student]),
    MulterModule.register({
      dest: './uploads/audio',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    StudentsModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}