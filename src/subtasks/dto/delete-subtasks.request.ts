import { IsArray, IsNumber } from 'class-validator';

export class DeleteSubtasksRequest {
  @IsArray()
  @IsNumber({}, { each: true })
  subtaskIds: number[];
}
