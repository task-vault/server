import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksService } from './subtasks.service';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TasksModule } from '../tasks/tasks.module';

describe('SubtasksService', () => {
  let service: SubtasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DrizzleModule,
        TasksModule,
      ],
      providers: [SubtasksService],
    }).compile();

    service = module.get<SubtasksService>(SubtasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
