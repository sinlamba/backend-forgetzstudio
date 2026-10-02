import { Test, TestingModule } from '@nestjs/testing';
import { MediapostService } from './mediapost.service';

describe('MediapostService', () => {
  let service: MediapostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediapostService],
    }).compile();

    service = module.get<MediapostService>(MediapostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
