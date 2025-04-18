import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubtaskRequest {
  @IsString()
  @IsNotEmpty()
  title: string;
}
