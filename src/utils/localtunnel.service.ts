import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import localtunnel, { Tunnel } from 'localtunnel';
import { ConfigService } from '../config/config.service';
import { AppLogger } from '@/utils/app-logger.service';

// https://igeo-39b76ae6-6f.loca.lt/webhooks/clerk
const expectedSubDomain = 'igeo-39b76ae6-6f';

@Injectable()
export class LocalTunnelService implements OnModuleInit, OnModuleDestroy {
  private tunnel: Tunnel | null = null;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    await this.startLocalTunnel();
  }

  onModuleDestroy() {
    this.closeLocalTunnel();
  }

  private async startLocalTunnel(): Promise<void> {
    if (
      this.configService.get<string>('LOCAL_TUNNEL_ENABLED', 'false') === 'true'
    ) {
      this.logger.log('Trying to open tunnel...');
      try {
        const configValues = {
          port: 3001,
          subdomain: expectedSubDomain,
        };

        this.tunnel = await localtunnel(configValues);

        if (this.tunnel.url !== `https://${expectedSubDomain}.loca.lt`) {
          this.logger.error(
            `Unexpected tunnel URL: expected https://${expectedSubDomain}.loca.lt but got ${this.tunnel.url}`,
          );
        }

        this.logger.error(`Tunnel is open at ${this.tunnel.url}`);

        this.tunnel.on('close', () => {
          this.logger.log('Tunnel closed');
        });

        this.tunnel.on('error', (err: Error) => {
          this.logger.error('Tunnel error', { error: err.stack });
        });
      } catch (err) {
        this.logger.error('Error starting local tunnel', { error: err });
      }
    }
  }

  private closeLocalTunnel(): void {
    if (this.tunnel) {
      this.tunnel.close();
      this.logger.log('Tunnel closed');
    }
  }
}
