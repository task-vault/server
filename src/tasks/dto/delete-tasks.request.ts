import { IsArray, IsNumber } from 'class-validator';

export class DeleteTasksRequest {
  @IsArray()
  @IsNumber({}, { each: true })
  taskIds: number[];
}
