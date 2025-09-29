import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../../entities/achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  async create(achievementData: Partial<Achievement>): Promise<Achievement> {
    const achievement = this.achievementRepository.create(achievementData);
    return this.achievementRepository.save(achievement);
  }

  async findAll(): Promise<Achievement[]> {
    return this.achievementRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Achievement> {
    return this.achievementRepository.findOne({ where: { id } });
  }
}