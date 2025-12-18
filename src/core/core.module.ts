import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import ms from 'ms';
import { PrismaModule } from '../prisma/prisma.module';
import { AppLogger } from '@/utils/app-logger.service';
import { ClsModule } from 'nestjs-cls';

@Global()
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CacheModule.register({
      isGlobal: true,
      ttl: ms('5 minutes'),
    }),
    ClsModule.forRoot({
      middleware: { mount: true }, // auto-attach to HTTP requests
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class CoreModule {}
