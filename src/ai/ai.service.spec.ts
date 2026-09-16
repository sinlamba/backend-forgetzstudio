import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ChunkingService } from '../chunking/chunking.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { ConfigService } from '@nestjs/config';

// Mock file ChunkingService sebelum digunakan
jest.mock('../chunking/chunking.service', () => ({
  ChunkingService: jest.fn().mockImplementation(() => ({
    chunk: jest.fn(),
  })),
}));
const mockChunkingService = {
  chunk: jest.fn(),
};

const mockQdrantService = {
  search: jest.fn(),
  upsert: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
  getOrThrow: jest.fn().mockReturnValue('dummy-api-key'),
};
describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ChunkingService,
          useValue: mockChunkingService,
        },
        {
          provide: QdrantService,
          useValue: mockQdrantService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
