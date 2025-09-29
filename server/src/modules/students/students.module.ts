import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from '../../entities/student.entity';
import { User } from '../../entities/user.entity';
import { Progress } from '../../entities/progress.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';
import { Badge } from '../../entities/badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User, Progress, ActivityCompletion, Badge])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}