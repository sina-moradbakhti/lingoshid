import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(AuthGuard('jwt'))
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new Error('Student profile not found');
    }
    return this.studentsService.getStudentDashboard(student.id);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('grade') grade?: string, @Query('limit') limit?: string) {
    const gradeNum = grade ? parseInt(grade) : undefined;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.studentsService.getLeaderboard(gradeNum, limitNum);
  }

  @Get('by-teacher/:teacherId')
  getStudentsByTeacher(@Param('teacherId') teacherId: string) {
    return this.studentsService.getStudentsByTeacher(teacherId);
  }

  @Get('by-parent/:parentId')
  getStudentsByParent(@Param('parentId') parentId: string) {
    return this.studentsService.getStudentsByParent(parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/badges')
  getStudentBadges(@Param('id') id: string) {
    return this.studentsService.getStudentBadges(id);
  }

  @Get(':id/detailed-progress')
  getDetailedProgress(@Param('id') id: string) {
    return this.studentsService.getDetailedProgress(id);
  }

  @Post(':id/update-progress')
  updateProgress(
    @Param('id') id: string,
    @Body() updateData: { pointsEarned: number; activityType: string }
  ) {
    return this.studentsService.updateStudentProgress(id, updateData.pointsEarned, updateData.activityType);
  }
}