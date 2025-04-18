import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubtaskRequest {
  @IsString()
  @IsNotEmpty()
  title: string;
}
