"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationErrorException = void 0;
const common_1 = require("@nestjs/common");
class ApplicationErrorException extends common_1.HttpException {
    constructor(applicationErrorCode, httpStatusCode, customErrorMessage) {
        const resolvedHttpStatus = httpStatusCode ||
            ApplicationErrorException.resolveHttpStatusFromErrorCode(applicationErrorCode.code);
        const resolvedErrorMessage = customErrorMessage || applicationErrorCode.description;
        super({
            error: applicationErrorCode.error,
            code: applicationErrorCode.code,
            description: resolvedErrorMessage,
            title: resolvedErrorMessage,
        }, resolvedHttpStatus);
        this.applicationErrorCode = applicationErrorCode;
        this.httpStatusCode = resolvedHttpStatus;
        this.customErrorMessage = customErrorMessage;
    }
    static resolveHttpStatusFromErrorCode(errorCode) {
        if (errorCode >= 1000 && errorCode < 2000) {
            return errorCode === 1001
                ? common_1.HttpStatus.UNAUTHORIZED
                : common_1.HttpStatus.FORBIDDEN;
        }
        else if (errorCode >= 2000 && errorCode < 3000) {
            return common_1.HttpStatus.BAD_REQUEST;
        }
        else if (errorCode >= 3000 && errorCode < 4000) {
            return common_1.HttpStatus.NOT_FOUND;
        }
        else if (errorCode >= 4000 && errorCode < 5000) {
            return common_1.HttpStatus.BAD_REQUEST;
        }
        else if (errorCode >= 5000 && errorCode < 6000) {
            return common_1.HttpStatus.BAD_GATEWAY;
        }
        else if (errorCode >= 6000 && errorCode < 7000) {
            return errorCode === 6002
                ? common_1.HttpStatus.SERVICE_UNAVAILABLE
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
        else if (errorCode >= 7000 && errorCode < 8000) {
            return common_1.HttpStatus.BAD_REQUEST;
        }
        return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
    getApplicationErrorCode() {
        return this.applicationErrorCode;
    }
    buildErrorResponsePayload() {
        return {
            error: this.applicationErrorCode.error,
            code: this.applicationErrorCode.code,
            description: this.customErrorMessage || this.applicationErrorCode.description,
            title: this.customErrorMessage || this.applicationErrorCode.title,
            message: this.customErrorMessage || this.applicationErrorCode.description,
        };
    }
}
exports.ApplicationErrorException = ApplicationErrorException;
//# sourceMappingURL=app-error.exception.js.map