import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ClaudeProvider } from './providers/claude.provider';
import { ConversationSession } from '../../entities/conversation-session.entity';
import { Student } from '../../entities/student.entity';
import { Activity } from '../../entities/activity.entity';
import { Progress } from '../../entities/progress.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';

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
  ],
  controllers: [AiController],
  providers: [AiService, ClaudeProvider],
  exports: [AiService],
})
export class AiModule {}
