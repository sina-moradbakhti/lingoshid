import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeachersService } from './teachers.service';

@Controller('teachers')
@UseGuards(AuthGuard('jwt'))
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.getTeacherDashboard(teacher.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Post(':teacherId/assign-student/:studentId')
  assignStudent(@Param('teacherId') teacherId: string, @Param('studentId') studentId: string) {
    return this.teachersService.assignStudentToTeacher(teacherId, studentId);
  }

  @Post(':teacherId/create-class')
  createClass(@Param('teacherId') teacherId: string, @Body() classData: any) {
    return this.teachersService.createClass(teacherId, classData);
  }

  @Get('class/:classId/analytics')
  getClassAnalytics(@Param('classId') classId: string) {
    return this.teachersService.getClassAnalytics(classId);
  }
}