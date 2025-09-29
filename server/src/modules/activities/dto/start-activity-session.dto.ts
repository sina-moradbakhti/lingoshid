import { IsString, IsOptional, IsObject } from 'class-validator';

export class StartActivitySessionDto {
  @IsString()
  activityId: string;

  @IsOptional()
  @IsObject()
  sessionConfig?: {
    skipIntro?: boolean;
    startFromStage?: number;
    practiceMode?: boolean;
  };
}