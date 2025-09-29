import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../../entities/badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
  ) {}

  async create(badgeData: Partial<Badge>): Promise<Badge> {
    const badge = this.badgeRepository.create(badgeData);
    return this.badgeRepository.save(badge);
  }

  async findAll(): Promise<Badge[]> {
    return this.badgeRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Badge> {
    return this.badgeRepository.findOne({ where: { id } });
  }

  async seedBadges() {
    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first speaking activity',
        iconUrl: '/badges/first-steps.png',
        criteria: { type: 'activities_completed', value: 1 },
        pointsRequired: 0,
        isRare: false,
      },
      {
        name: 'Brave Speaker',
        description: 'Speak for 5 minutes total',
        iconUrl: '/badges/brave-speaker.png',
        criteria: { type: 'total_speaking_time', value: 300 },
        pointsRequired: 50,
        isRare: false,
      },
      {
        name: 'Pronunciation Pro',
        description: 'Achieve 80% pronunciation accuracy',
        iconUrl: '/badges/pronunciation-pro.png',
        criteria: { type: 'pronunciation_accuracy', value: 80 },
        pointsRequired: 100,
        isRare: false,
      },
      {
        name: 'Conversation Master',
        description: 'Complete 10 dialogue activities',
        iconUrl: '/badges/conversation-master.png',
        criteria: { type: 'dialogue_activities', value: 10 },
        pointsRequired: 200,
        isRare: true,
      },
      {
        name: 'Story Teller',
        description: 'Record and share one story',
        iconUrl: '/badges/story-teller.png',
        criteria: { type: 'stories_created', value: 1 },
        pointsRequired: 75,
        isRare: false,
      },
      {
        name: 'Daily Learner',
        description: 'Login for 7 consecutive days',
        iconUrl: '/badges/daily-learner.png',
        criteria: { type: 'streak_days', value: 7 },
        pointsRequired: 150,
        isRare: false,
      },
      {
        name: 'Helper Friend',
        description: 'Complete 5 peer assistance activities',
        iconUrl: '/badges/helper-friend.png',
        criteria: { type: 'peer_help', value: 5 },
        pointsRequired: 100,
        isRare: false,
      },
    ];

    for (const badgeData of badges) {
      const existingBadge = await this.badgeRepository.findOne({
        where: { name: badgeData.name },
      });

      if (!existingBadge) {
        const badge = this.badgeRepository.create(badgeData);
        await this.badgeRepository.save(badge);
      }
    }
  }
}