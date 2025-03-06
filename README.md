# Serverless TypeScript API Service

A serverless backend API built with NestJS, TypeScript, Prisma, and AWS Lambda.

## 🚀 Features

- **Serverless Architecture**: Built on AWS Lambda for scalability and cost efficiency
- **Modern Stack**: NestJS, TypeScript, and Prisma ORM
- **Versatile Development**: Single entry point for both local development and production
- **API Documentation**: Integrated Swagger documentation
- **Data Validation**: Built-in validation using class-validator
- **Robust Monitoring**: Health checks to ensure service reliability
- **Route Separation**: Clear distinction between Admin and Public API routes
- **File Management**: S3 integration for file upload capabilities

## 📋 Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database
- AWS CLI (for deployment)
- Serverless Framework CLI
- Required environment variables (see Configuration section)

## 🛠️ Getting Started

### Configuration

1. Create your environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your database connection string and other required variables.

### Installation

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:generatesql
npm run prisma:migrate
```

### Local Development

1. Spin Up the Local DB Container:

```bash
docker-compose up -d
```

Update your `.env` file to point to the local database:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/metadata"
```

1. Start the development server:

```bash
npm run start:dev
```

## Testing

This project uses Jest for unit and integration testing.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### Test Folder Structure

The tests are organized to mirror the project structure:

```
src/
└── __tests__/
    ├── example/
    │   └── example.test.ts
    ├── utils/
    │   └── mappers.test.ts
    ├── api/
    │   ├── controllers/
    │   └── services/
    ├── auth/
    └── ...
```

Each test file should be placed in a directory that mirrors the location of the file it's testing, and should have the `.test.ts` extension.

### Writing Tests

Tests should follow these conventions:

1. Import the module/function/class to test
2. Use descriptive test names with the `describe` and `it` functions
3. Follow the Arrange-Act-Assert pattern

Example test:

```typescript
import { convertPrismaNumberToNumber } from '@/utils/mappers';

describe('Mappers', () => {
  describe('convertPrismaNumberToNumber', () => {
    it('should convert a bigint to a number', () => {
      // Arrange
      const bigintValue = 1n;

      // Act
      const result = convertPrismaNumberToNumber(bigintValue);

      // Assert
      expect(result).toBe(1);
    });

    it('should return null for undefined values', () => {
      expect(convertPrismaNumberToNumber(undefined)).toBeNull();
    });
  });
});
```

To mock dependencies, use Jest's mocking capabilities:

```typescript
jest.mock('@/path/to/module', () => ({
  someFunction: jest.fn().mockReturnValue('mocked value'),
}));
```

For NestJS services and controllers, you can use the testing utilities provided by NestJS:

```typescript
import { Test } from '@nestjs/testing';
import { YourService } from '@/your/service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = moduleRef.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## 📤 Deployment

**Prerequisites**:

- Change the env vars in the `.env` to point to stage/prod:

  - `DATABASE_URL`
  - `BUILD_DATABASE_URL` (Should point to local DB)

- Auth Docker to push to our private ECR:

```bash
AWS_PROFILE=gamify aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 613957054253.dkr.ecr.us-east-1.amazonaws.com
```

1. **Migrations (if needed)**:

```bash
npm run prisma:deploy
```

1. **Push**:

```bash
npm run deploy
```

## 🔍 API Documentation

When running locally, use the Swagger documentation.
