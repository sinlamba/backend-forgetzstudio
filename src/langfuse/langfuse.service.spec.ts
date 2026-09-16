import { Test, TestingModule } from '@nestjs/testing';
import { LangfuseService } from './langfuse.service';

describe('LangfuseService', () => {
  let service: LangfuseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LangfuseService],
    }).compile();

    service = module.get<LangfuseService>(LangfuseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
