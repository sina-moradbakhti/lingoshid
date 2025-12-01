import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController, AiPublicController } from './ai.controller';
import { PersonalizedPracticeController } from './personalized-practice.controller';
import { ClaudeProvider } from './providers/claude.provider';
import { StudentAnalyticsService } from './student-analytics.service';
import { PersonalizedPracticeGeneratorService } from './personalized-practice-generator.service';
import { ConversationSession } from '../../entities/conversation-session.entity';
import { Student } from '../../entities/student.entity';
import { Activity } from '../../entities/activity.entity';
import { Progress } from '../../entities/progress.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ConversationSession,
      Student,
      Activity,
      Progress,
      ActivityCompletion,
    ]),
    StudentsModule, // Import StudentsModule to access StudentsService
  ],
  controllers: [AiController, AiPublicController, PersonalizedPracticeController],
  providers: [
    AiService,
    ClaudeProvider,
    StudentAnalyticsService,
    PersonalizedPracticeGeneratorService,
  ],
  exports: [AiService, StudentAnalyticsService, PersonalizedPracticeGeneratorService],
})
export class AiModule {}
