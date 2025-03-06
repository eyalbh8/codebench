// test/app.e2e-spec.ts
import './test-setup'; // Must be at the top
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('E2E Flow (Descope login → create account → get account)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in via Descope and creates account', async () => {
    // you'll call loginDescopeTestUser() here later
  });
});
