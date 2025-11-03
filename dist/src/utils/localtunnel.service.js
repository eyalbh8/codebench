"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalTunnelService = void 0;
const common_1 = require("@nestjs/common");
const localtunnel_1 = __importDefault(require("localtunnel"));
const config_service_1 = require("../config/config.service");
const app_logger_service_1 = require("./app-logger.service");
const expectedSubDomain = 'igeo-39b76ae6-6f';
let LocalTunnelService = class LocalTunnelService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.tunnel = null;
    }
    async onModuleInit() {
        await this.startLocalTunnel();
    }
    onModuleDestroy() {
        this.closeLocalTunnel();
    }
    async startLocalTunnel() {
        if (this.configService.get('LOCAL_TUNNEL_ENABLED', 'false') === 'true') {
            this.logger.log('Trying to open tunnel...');
            try {
                const configValues = {
                    port: 3001,
                    subdomain: expectedSubDomain,
                };
                this.tunnel = await (0, localtunnel_1.default)(configValues);
                if (this.tunnel.url !== `https://${expectedSubDomain}.loca.lt`) {
                    this.logger.error(`Unexpected tunnel URL: expected https://${expectedSubDomain}.loca.lt but got ${this.tunnel.url}`);
                }
                this.logger.error(`Tunnel is open at ${this.tunnel.url}`);
                this.tunnel.on('close', () => {
                    this.logger.log('Tunnel closed');
                });
                this.tunnel.on('error', (err) => {
                    this.logger.error('Tunnel error', { error: err.stack });
                });
            }
            catch (err) {
                this.logger.error('Error starting local tunnel', { error: err });
            }
        }
    }
    closeLocalTunnel() {
        if (this.tunnel) {
            this.tunnel.close();
            this.logger.log('Tunnel closed');
        }
    }
};
exports.LocalTunnelService = LocalTunnelService;
exports.LocalTunnelService = LocalTunnelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        app_logger_service_1.AppLogger])
], LocalTunnelService);
//# sourceMappingURL=localtunnel.service.js.map