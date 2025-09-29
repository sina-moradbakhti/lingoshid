import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { Activity } from './activity.entity';

@Entity('activity_completions')
export class ActivityCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  pointsEarned: number;

  @Column({ default: 0 })
  timeSpent: number; // in seconds

  @Column({ default: false })
  isCompleted: boolean;

  @Column('json', { nullable: true })
  submissionData: any; // Audio recordings, text responses, etc.

  @Column('json', { nullable: true })
  feedback: any; // AI or teacher feedback

  @CreateDateColumn()
  completedAt: Date;

  // Relations
  @ManyToOne(() => Student, student => student.activityCompletions)
  student: Student;

  @ManyToOne(() => Activity, activity => activity.completions)
  activity: Activity;
}