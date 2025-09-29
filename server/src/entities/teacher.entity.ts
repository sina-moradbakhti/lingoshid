import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';
import { Class } from './class.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  schoolName: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ default: 0 })
  yearsOfExperience: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, user => user.teacherProfile)
  @JoinColumn()
  user: User;

  @OneToMany(() => Student, student => student.teacher)
  students: Student[];

  @OneToMany(() => Class, classEntity => classEntity.teacher)
  classes: Class[];
}