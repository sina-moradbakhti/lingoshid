import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Parent } from './parent.entity';
import { Progress } from './progress.entity';
import { Achievement } from './achievement.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT
  })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Student, student => student.user)
  studentProfile: Student;

  @OneToOne(() => Teacher, teacher => teacher.user)
  teacherProfile: Teacher;

  @OneToOne(() => Parent, parent => parent.user)
  parentProfile: Parent;

  @OneToMany(() => Progress, progress => progress.user)
  progress: Progress[];

  @ManyToMany(() => Achievement)
  @JoinTable()
  achievements: Achievement[];
}