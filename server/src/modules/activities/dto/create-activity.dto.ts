import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ActivityType, DifficultyLevel, SkillArea } from '../../../enums/activity-type.enum';

export class CreateActivityDto {
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
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}