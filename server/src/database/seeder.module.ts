import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { Teacher } from '../entities/teacher.entity';
import { Badge } from '../entities/badge.entity';
import { Activity } from '../entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Parent,
      Teacher,
      Badge,
      Activity,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}