import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';
import { SkillArea } from '../enums/activity-type.enum';

@Entity('progress')
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SkillArea
  })
  skillArea: SkillArea;

  @Column({ default: 0 })
  currentScore: number;

  @Column({ default: 0 })
  previousScore: number;

  @Column({ default: 0 })
  totalActivitiesCompleted: number;

  @Column({ default: 0 })
  totalTimeSpent: number; // in minutes

  @Column({ default: 1 })
  assessmentLevel: number; // 1-5 based on rubric

  @Column('json', { nullable: true })
  detailedMetrics: any; // Specific metrics for each skill area

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.progress)
  user: User;

  @ManyToOne(() => Student, student => student.progress)
  student: Student;
}