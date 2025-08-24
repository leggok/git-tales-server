import { Test, TestingModule } from '@nestjs/testing';
import { GitWebhooksController } from './git-webhooks.controller';

describe('GitWebhooksController', () => {
  let controller: GitWebhooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitWebhooksController],
    }).compile();

    controller = module.get<GitWebhooksController>(GitWebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
