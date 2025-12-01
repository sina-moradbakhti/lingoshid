import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ActivityType, DifficultyLevel, SkillArea } from '../enums/activity-type.enum';
import { ActivityCompletion } from './activity-completion.entity';
import { ActivitySession } from './activity-session.entity';
import { ConversationSession } from './conversation-session.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ActivityType
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.BEGINNER
  })
  difficulty: DifficultyLevel;

  @Column({
    type: 'enum',
    enum: SkillArea
  })
  skillArea: SkillArea;

  @Column({ default: 10 })
  pointsReward: number;

  @Column({ default: 1 })
  minLevel: number;

  @Column({ nullable: true })
  maxLevel: number;

  @Column('json', { nullable: true })
  content: any; // Flexible content structure for different activity types

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  audioUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ActivityCompletion, completion => completion.activity)
  completions: ActivityCompletion[];

  @OneToMany(() => ActivitySession, session => session.activity)
  sessions: ActivitySession[];

  @OneToMany(() => ConversationSession, session => session.activity)
  conversationSessions: ConversationSession[];
}