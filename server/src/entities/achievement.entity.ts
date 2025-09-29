import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  iconUrl: string;

  @Column({ default: 0 })
  pointsReward: number;

  @Column('json')
  unlockCriteria: any; // Conditions to unlock this achievement

  @Column({ default: false })
  isSecret: boolean; // Hidden until unlocked

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}