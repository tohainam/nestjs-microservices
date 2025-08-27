import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthServiceModule } from './../src/auth-service.module';

describe('AuthServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    const httpServer = app.getHttpServer();
    const response = await request(httpServer).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
