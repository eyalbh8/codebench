import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '../config/config.service';
import { DescopeService } from './descope.service';
import { RoleBasedAuthGuard } from './role-based-auth.guard';
import { DBUserAuthGuard } from './db.user.auth.guard';
import { CoreModule } from '@/core/core.module';
import { ClsModule } from 'nestjs-cls';
@Module({
  imports: [
    ClsModule.forRoot({
      middleware: { mount: true }, // auto-attach to HTTP requests
    }),
    ConfigModule,
    CoreModule,
  ],
  providers: [
    ConfigService,
    DescopeService,
    RoleBasedAuthGuard,
    DBUserAuthGuard,
  ],
  exports: [RoleBasedAuthGuard, DBUserAuthGuard, DescopeService],
})
export class AuthModule {}
