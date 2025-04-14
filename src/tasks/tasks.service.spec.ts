import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DrizzleModule, ConfigModule.forRoot({ isGlobal: true })],
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
