import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksController } from './subtasks.controller';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TasksModule } from '../tasks/tasks.module';

describe('SubtasksController', () => {
  let controller: SubtasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DrizzleModule,
        TasksModule,
      ],
      controllers: [SubtasksController],
    }).compile();

    controller = module.get<SubtasksController>(SubtasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
