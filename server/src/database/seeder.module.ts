import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { Teacher } from '../entities/teacher.entity';
import { Badge } from '../entities/badge.entity';
import { Activity } from '../entities/activity.entity';
import { ActivityCompletion } from '../entities/activity-completion.entity';
import { ActivitySession } from '../entities/activity-session.entity';
import { Progress } from '../entities/progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Parent,
      Teacher,
      Badge,
      Activity,
      ActivityCompletion,
      ActivitySession,
      Progress,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}