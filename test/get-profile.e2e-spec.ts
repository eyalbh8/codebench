import './test-setup';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { loginDescopeTestUser } from './utils/descope-auth';

// Use dynamic import to avoid TypeScript issues with supertest
const request = async (app: any) => {
  const supertestModule = await import('supertest');
  return supertestModule.default(app);
};

describe('E2E Flow (Descope login → get profile)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const auth = await loginDescopeTestUser();
    token = auth.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('fetches profile using Descope token', async () => {
    const req = await request(app.getHttpServer());
    const res = await req
      .get('/profile') // or your actual authenticated endpoint
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test-e2e@igeo.ai');
    expect(res.body.isOnboarded).toBe(false);
  });
});
