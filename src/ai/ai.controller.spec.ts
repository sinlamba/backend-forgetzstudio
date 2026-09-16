jest.mock('semantic-chunking', () => ({
  chunkit: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { success } from 'zod/v4';

describe('AiController', () => {
  let controller: AiController;

  const mockAiService = {
    chat: jest.fn(),
    embedding: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('return value from ai ', async () => {
      mockAiService.chat.mockResolvedValue('hello bro');

      const res = await controller.chat('halo');

      expect(mockAiService.chat).toHaveBeenCalledWith('halo');

      expect(res).toEqual({
        success: true,
        answer: 'hello bro',
      });
    });
  });
});
