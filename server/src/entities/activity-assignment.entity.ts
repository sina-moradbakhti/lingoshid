import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Activity } from './activity.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';

@Entity('activity_assignments')
export class ActivityAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Activity, { eager: true })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'assignedBy' })
  assignedBy: Teacher;

  @CreateDateColumn()
  assignedAt: Date;
}