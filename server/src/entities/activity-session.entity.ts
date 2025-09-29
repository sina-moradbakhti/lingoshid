import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { Activity } from './activity.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  PAUSED = 'paused'
}

@Entity('activity_sessions')
export class ActivitySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE
  })
  status: SessionStatus;

  @Column({ default: 1 })
  currentStage: number;

  @Column({ default: 0 })
  totalStages: number;

  @Column({ default: 0 })
  currentScore: number;

  @Column({ default: 0 })
  pointsEarned: number;

  @Column({ default: 0 })
  timeSpent: number; // in seconds

  @Column('json', { nullable: true })
  stageData: any; // Progress data for each stage

  @Column('json', { nullable: true })
  sessionConfig: any; // Configuration options

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  lastActivityAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  // Relations
  @ManyToOne(() => Student, student => student.activitySessions, { eager: true })
  student: Student;

  @ManyToOne(() => Activity, activity => activity.sessions, { eager: true })
  activity: Activity;
}