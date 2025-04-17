import { IsArray, IsNumber } from 'class-validator';

export class CompleteSubtasksRequest {
  @IsArray()
  @IsNumber({}, { each: true })
  subtaskIds: number[];
}
