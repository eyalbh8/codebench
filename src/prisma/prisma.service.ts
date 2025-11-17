import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean the database during testing
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      // Get all Prisma model delegates
      const modelNames = Object.keys(this).filter((key) => {
        const value = this[key as keyof this];
        return (
          value &&
          typeof value === 'object' &&
          'deleteMany' in value &&
          typeof (value as Record<string, unknown>).deleteMany === 'function'
        );
      });

      await Promise.all(
        modelNames.map(async (modelName) => {
          const model = this[modelName as keyof this] as {
            deleteMany: () => Promise<unknown>;
          };
          return model.deleteMany();
        }),
      );
    }
  }
}
