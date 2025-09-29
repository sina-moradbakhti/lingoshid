import { IsString, IsNumber, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class SubmitStageDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  stageNumber: number;

  @IsString()
  stageType: string; // 'pronunciation', 'description', 'conversation'

  @IsOptional()
  @IsObject()
  audioData?: {
    blob: any; // Base64 encoded audio
    duration: number;
    format: string;
  };

  @IsOptional()
  @IsObject()
  textData?: {
    response: string;
    timeSpent: number;
  };

  @IsNumber()
  timeSpent: number;

  @IsBoolean()
  isCompleted: boolean;
}