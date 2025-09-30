import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Query, Put, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeachersService } from './teachers.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateCustomPracticeDto } from './dto/create-custom-practice.dto';

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

  @Get('analytics')
  async getAnalytics(@Request() req) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.getTeacherAnalytics(teacher.id);
  }

  @Get('students')
  async getStudentsList(@Request() req) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.getStudentsList(teacher.id);
  }

  @Post('students')
  async createStudent(@Request() req, @Body() createStudentDto: CreateStudentDto) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.createStudent(teacher.id, createStudentDto);
  }

  @Put('students/:studentId')
  async updateStudent(
    @Request() req,
    @Param('studentId') studentId: string,
    @Body() updateStudentDto: UpdateStudentDto
  ) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.updateStudent(teacher.id, studentId, updateStudentDto);
  }

  @Patch('students/:studentId/credentials')
  async updateStudentCredentials(
    @Request() req,
    @Param('studentId') studentId: string,
    @Query('type') type: 'student' | 'parent'
  ) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.updateStudentCredentials(teacher.id, studentId, type);
  }

  @Get('class/:classId/analytics')
  getClassAnalytics(@Param('classId') classId: string) {
    return this.teachersService.getClassAnalytics(classId);
  }

  @Post('custom-practices')
  async createCustomPractice(@Request() req, @Body() createDto: CreateCustomPracticeDto) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.createCustomPractice(teacher.id, createDto);
  }

  @Get('custom-practices')
  async getCustomPractices(@Request() req) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.getCustomPractices(teacher.id);
  }

  @Delete('custom-practices/:activityId')
  async deleteCustomPractice(@Request() req, @Param('activityId') activityId: string) {
    const teacher = await this.teachersService.findByUserId(req.user.userId);
    if (!teacher) {
      throw new Error('Teacher profile not found');
    }
    return this.teachersService.deleteCustomPractice(teacher.id, activityId);
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
}