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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const nestjs_cls_1 = require("nestjs-cls");
let AppLogger = class AppLogger {
    constructor(cls) {
        this.cls = cls;
        this.log_levels = ['error', 'warn', 'info', 'exception'];
        this.contextKeys = [
            'error',
            'errorCode',
            'errorType',
            'userId',
            'accountId',
            'accountName',
            'requestId',
            'runId',
            'userEmail',
            'path',
            'method',
            'version',
            'asyncJobId',
        ];
    }
    getColorCode(level) {
        const colors = {
            error: '\x1b[31m',
            exception: '\x1b[31m',
            warn: '\x1b[33m',
            info: '\x1b[36m',
            debug: '\x1b[90m',
        };
        return colors[level] || '\x1b[0m';
    }
    formatLog(level, message, meta = {}) {
        let context = {};
        if (this.cls) {
            context = Object.fromEntries(this.contextKeys.map((key) => [key, this.cls.get(key)]));
        }
        if (process.env.NODE_ENV === 'development') {
            const colorCode = this.getColorCode(level);
            const resetCode = '\x1b[0m';
            const logMessage = `${colorCode}${new Date().toISOString()} - ${level.toUpperCase()}${resetCode} - ${message} - ${JSON.stringify(meta)}`;
            const newLineMessage = logMessage.replace(/\\n/g, '\n');
            console.log(newLineMessage);
        }
        else {
            const logEntry = {
                level,
                timestamp: new Date().toISOString(),
                message,
                ...context,
                ...meta,
            };
            process.stdout.write(JSON.stringify(logEntry) + '\n');
        }
    }
    log(message, meta) {
        if (this.log_levels.includes('info')) {
            this.formatLog('info', message, meta);
        }
    }
    error(message, meta) {
        if (this.log_levels.includes('error')) {
            this.formatLog('error', message, meta);
        }
    }
    warn(message, meta) {
        if (this.log_levels.includes('warn')) {
            this.formatLog('warn', message, meta);
        }
    }
    debug(message, meta) {
        if (this.log_levels.includes('debug')) {
            this.formatLog('debug', message, meta);
        }
    }
    exception(message, meta) {
        if (this.log_levels.includes('exception')) {
            this.formatLog('exception', message, meta);
        }
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_cls_1.ClsService])
], AppLogger);
//# sourceMappingURL=app-logger.service.js.map