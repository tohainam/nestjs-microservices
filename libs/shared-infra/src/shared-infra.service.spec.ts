import { Test, TestingModule } from '@nestjs/testing';
import { SharedInfraService } from './shared-infra.service';

describe('SharedInfraService', () => {
  let service: SharedInfraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedInfraService],
    }).compile();

    service = module.get<SharedInfraService>(SharedInfraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
