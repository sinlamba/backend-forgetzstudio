import { Test, TestingModule } from '@nestjs/testing';
import { MediapostController } from './mediapost.controller';

describe('MediapostController', () => {
  let controller: MediapostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediapostController],
    }).compile();

    controller = module.get<MediapostController>(MediapostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
