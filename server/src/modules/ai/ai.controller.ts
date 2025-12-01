import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Start a new AI conversation
   * POST /api/ai/conversation/start
   */
  @Post('conversation/start')
  async startConversation(
    @Request() req,
    @Body() dto: StartConversationDto
  ) {
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      throw new Error('Only students can start conversations');
    }

    const result = await this.aiService.startConversation(studentId, dto);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Send a message in ongoing conversation
   * POST /api/ai/conversation/message
   */
  @Post('conversation/message')
  async sendMessage(
    @Request() req,
    @Body() dto: SendMessageDto
  ) {
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      throw new Error('Only students can send messages');
    }

    const result = await this.aiService.sendMessage(studentId, dto);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * End conversation and get evaluation
   * POST /api/ai/conversation/:sessionId/end
   */
  @Post('conversation/:sessionId/end')
  async endConversation(
    @Request() req,
    @Param('sessionId') sessionId: string
  ) {
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      throw new Error('Only students can end conversations');
    }

    const result = await this.aiService.endConversation(studentId, sessionId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get conversation session details
   * GET /api/ai/conversation/:sessionId
   */
  @Get('conversation/:sessionId')
  async getSession(
    @Request() req,
    @Param('sessionId') sessionId: string
  ) {
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      throw new Error('Unauthorized');
    }

    const session = await this.aiService.getSession(sessionId, studentId);

    return {
      success: true,
      data: session,
    };
  }

  /**
   * Get student's conversation history
   * GET /api/ai/conversations
   */
  @Get('conversations')
  async getConversations(@Request() req) {
    const studentId = req.user.studentProfile?.id;

    if (!studentId) {
      throw new Error('Unauthorized');
    }

    const conversations = await this.aiService.getStudentConversations(studentId);

    return {
      success: true,
      data: conversations,
    };
  }

  /**
   * Health check for AI service
   * GET /api/ai/health
   */
  @Get('health')
  async healthCheck() {
    const health = await this.aiService.healthCheck();

    return {
      success: true,
      data: health,
    };
  }
}
