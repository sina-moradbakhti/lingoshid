import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateStudentDto {
  // Student Information
  @IsString()
  studentFirstName: string;

  @IsString()
  studentLastName: string;

  @IsNumber()
  @Min(4)
  @Max(12)
  grade: number;

  @IsNumber()
  @Min(6)
  @Max(18)
  age: number;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  className?: string;

  // Parent Information
  @IsString()
  parentFirstName: string;

  @IsString()
  parentLastName: string;

  @IsOptional()
  @IsString()
  parentPhoneNumber?: string;

  @IsOptional()
  @IsString()
  parentOccupation?: string;
}