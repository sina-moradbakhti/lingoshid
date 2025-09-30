import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsUUID, IsObject } from 'class-validator';
import { ActivityType, DifficultyLevel, SkillArea } from '../../../enums/activity-type.enum';

export class CreateCustomPracticeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsEnum(SkillArea)
  skillArea: SkillArea;

  @IsNumber()
  pointsReward: number;

  @IsNumber()
  minLevel: number;

  @IsOptional()
  @IsNumber()
  maxLevel?: number;

  @IsOptional()
  @IsObject()
  content?: any;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedStudents?: string[]; // If empty or null, assign to all students
}