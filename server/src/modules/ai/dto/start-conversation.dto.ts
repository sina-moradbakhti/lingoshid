import { IsString, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';

export class StartConversationDto {
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

  @IsString()
  @IsNotEmpty()
  scenario: string;

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsNotEmpty()
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}
