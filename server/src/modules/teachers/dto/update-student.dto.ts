import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(12)
  grade?: number;

  @IsOptional()
  @IsNumber()
  @Min(6)
  @Max(18)
  age?: number;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  className?: string;
}