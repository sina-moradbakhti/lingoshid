import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string; // Can be email or username

  @IsString()
  @IsNotEmpty()
  password: string;
}