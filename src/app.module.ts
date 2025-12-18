import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { LocalTunnelService } from './utils/localtunnel.service';
import { ConfigService } from './config/config.service';
import { AppLogger } from './utils/app-logger.service';
import { ClsModule } from 'nestjs-cls';
import { LogInterceptor } from './utils/log.interceptor';
import { RequestIdMiddleware } from './utils/request.id.middleware';

@Module({
  imports: [
    ClsModule.forRoot({
      middleware: { mount: true }, // auto-attach to HTTP requests
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CoreModule,
    ApiModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LogInterceptor },
    LocalTunnelService,
    ConfigService,
    AppLogger,
  ],
  exports: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
