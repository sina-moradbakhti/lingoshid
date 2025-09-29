import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BadgesService } from './badges.service';

@Controller('badges')
@UseGuards(AuthGuard('jwt'))
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  create(@Body() badgeData: any) {
    return this.badgesService.create(badgeData);
  }

  @Get()
  findAll() {
    return this.badgesService.findAll();
  }

  @Get('seed')
  async seedBadges() {
    await this.badgesService.seedBadges();
    return { message: 'Badges seeded successfully' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.badgesService.findOne(id);
  }
}