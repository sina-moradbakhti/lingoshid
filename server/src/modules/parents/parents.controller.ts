import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParentsService } from './parents.service';

@Controller('parents')
@UseGuards(AuthGuard('jwt'))
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  findAll() {
    return this.parentsService.findAll();
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const parent = await this.parentsService.findByUserId(req.user.userId);
    if (!parent) {
      throw new Error('Parent profile not found');
    }
    return this.parentsService.getParentDashboard(parent.id);
  }

  @Get('children')
  async getChildren(@Request() req) {
    const parent = await this.parentsService.findByUserId(req.user.userId);
    if (!parent) {
      throw new Error('Parent profile not found');
    }
    return this.parentsService.getChildren(parent.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentsService.findOne(id);
  }

  @Get(':id/children-progress')
  getChildrenProgress(@Param('id') id: string) {
    return this.parentsService.getChildrenProgress(id);
  }

  @Post(':parentId/link-child/:studentId')
  linkChild(@Param('parentId') parentId: string, @Param('studentId') studentId: string) {
    return this.parentsService.linkChild(parentId, studentId);
  }
}