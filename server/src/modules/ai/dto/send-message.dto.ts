import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
