import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from '../../entities/teacher.entity';
import { Student } from '../../entities/student.entity';
import { Class } from '../../entities/class.entity';
import { User } from '../../entities/user.entity';
import { Parent } from '../../entities/parent.entity';
import { Activity } from '../../entities/activity.entity';
import { ActivityAssignment } from '../../entities/activity-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Student, Class, User, Parent, Activity, ActivityAssignment])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}