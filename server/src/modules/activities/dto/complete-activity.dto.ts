import { IsNumber, IsOptional, IsObject } from 'class-validator';

export class CompleteActivityDto {
  @IsNumber()
  timeSpent: number; // in seconds

  @IsOptional()
  @IsObject()
  submissionData?: any; // Audio recordings, text responses, etc.
}