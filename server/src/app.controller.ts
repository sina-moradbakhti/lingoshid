import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SeederService } from './database/seeder.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seederService: SeederService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed')
  async seedDatabase() {
    await this.seederService.seedAll();
    return { message: 'Database seeded successfully!' };
  }
}
