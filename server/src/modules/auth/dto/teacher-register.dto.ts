import { IsEmail, IsString, IsOptional, IsNumber, MinLength, IsBoolean } from 'class-validator';

export class TeacherRegisterDto {
  // Personal Information
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Contact Information
  @IsString()
  phoneNumber: string;

  // Institution Information
  @IsOptional()
  @IsString()
  institution?: string;

  @IsBoolean()
  isSelfEmployed: boolean;

  // Optional Professional Information
  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;
}