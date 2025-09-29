import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Parent } from './parent.entity';
import { Teacher } from './teacher.entity';
import { Progress } from './progress.entity';
import { ActivityCompletion } from './activity-completion.entity';
import { Badge } from './badge.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  grade: number; // 4, 5, or 6

  @Column()
  age: number;

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ default: 1 })
  currentLevel: number;

  @Column({ default: 0 })
  experiencePoints: number;

  @Column({ default: 'beginner' })
  proficiencyLevel: string;

  @Column({ nullable: true })
  schoolName: string;

  @Column({ nullable: true })
  className: string;

  @Column({ default: 0 })
  streakDays: number;

  @Column({ nullable: true })
  lastActivityDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, user => user.studentProfile)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Parent, parent => parent.children)
  parent: Parent;

  @ManyToOne(() => Teacher, teacher => teacher.students)
  teacher: Teacher;

  @OneToMany(() => Progress, progress => progress.student)
  progress: Progress[];

  @OneToMany(() => ActivityCompletion, completion => completion.student)
  activityCompletions: ActivityCompletion[];

  @ManyToMany(() => Badge)
  @JoinTable()
  badges: Badge[];
}