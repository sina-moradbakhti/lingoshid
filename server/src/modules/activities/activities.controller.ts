import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { StartActivitySessionDto } from './dto/start-activity-session.dto';
import { SubmitStageDto } from './dto/submit-stage.dto';
import { ActivityType, DifficultyLevel, SkillArea } from '../../enums/activity-type.enum';

@Controller('activities')
@UseGuards(AuthGuard('jwt'))
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(createActivityDto);
  }

  @Get()
  findAll(
    @Query('type') type?: ActivityType,
    @Query('difficulty') difficulty?: DifficultyLevel,
    @Query('skillArea') skillArea?: SkillArea,
  ) {
    if (type) {
      return this.activitiesService.findByType(type);
    }
    if (difficulty) {
      return this.activitiesService.findByDifficulty(difficulty);
    }
    if (skillArea) {
      return this.activitiesService.findBySkillArea(skillArea);
    }
    return this.activitiesService.findAll();
  }

  @Get('for-student')
  async getActivitiesForStudent(@Request() req) {
    // Assuming the user is a student, get their student profile
    const studentId = req.user.studentId; // This would need to be set in the JWT payload
    return this.activitiesService.findForStudent(studentId);
  }

  @Get('seed')
  async seedActivities() {
    await this.activitiesService.seedActivities();
    return { message: 'Activities seeded successfully' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id') id: string) {
    return this.activitiesService.getActivityAnalytics(id);
  }

  @Post(':id/complete')
  async completeActivity(
    @Param('id') activityId: string,
    @Body() completionData: CompleteActivityDto,
    @Request() req,
  ) {
    // Get student ID from the authenticated user
    const studentId = req.user.studentId; // This would need to be properly set
    return this.activitiesService.completeActivity(studentId, activityId, completionData);
  }

  @Get('progress/:studentId')
  getStudentProgress(@Param('studentId') studentId: string, @Query('activityId') activityId?: string) {
    return this.activitiesService.getStudentProgress(studentId, activityId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateActivityDto>) {
    return this.activitiesService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }

  // Activity Session Endpoints
  @Post('sessions/start')
  async startSession(@Body() sessionData: StartActivitySessionDto, @Request() req) {
    const studentId = req.user.studentId;
    return this.activitiesService.startActivitySession(studentId, sessionData);
  }

  @Get('sessions/:sessionId')
  getSession(@Param('sessionId') sessionId: string, @Request() req) {
    const studentId = req.user.studentId;
    return this.activitiesService.getActivitySession(sessionId, studentId);
  }

  @Post('sessions/:sessionId/stage')
  @UseInterceptors(FileInterceptor('audio'))
  async submitStage(
    @Param('sessionId') sessionId: string,
    @Body() stageData: SubmitStageDto,
    @UploadedFile() audioFile: any,
    @Request() req
  ) {
    const studentId = req.user.studentId;
    return this.activitiesService.submitStage(sessionId, stageData, audioFile, studentId);
  }

  @Post('sessions/:sessionId/complete')
  async completeSession(@Param('sessionId') sessionId: string, @Request() req) {
    const studentId = req.user.studentId;
    return this.activitiesService.completeActivitySession(sessionId, studentId);
  }

  @Get('sessions/:sessionId/feedback/:stageNumber')
  getStageFeedback(@Param('sessionId') sessionId: string, @Param('stageNumber') stageNumber: number) {
    return this.activitiesService.getStageFeedback(sessionId, stageNumber);
  }

  @Post('sessions/:sessionId/pause')
  pauseSession(@Param('sessionId') sessionId: string, @Request() req) {
    const studentId = req.user.studentId;
    return this.activitiesService.pauseActivitySession(sessionId, studentId);
  }

  @Post('sessions/:sessionId/resume')
  resumeSession(@Param('sessionId') sessionId: string, @Request() req) {
    const studentId = req.user.studentId;
    return this.activitiesService.resumeActivitySession(sessionId, studentId);
  }

  // Audio processing endpoint
  @Post('process-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async processAudio(@UploadedFile() audioFile: any, @Body() metadata: any) {
    return this.activitiesService.processAudioSubmission(audioFile, metadata);
  }
}