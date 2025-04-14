import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description?: string;

  @IsDateString()
  deadline?: Date;
}
