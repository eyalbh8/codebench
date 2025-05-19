"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountConfigurationSettingsDto = exports.AccountConfigurationSettingsSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const model_enums_1 = require("../../../model.enums");
exports.AccountConfigurationSettingsSchema = zod_1.z.object({
    accountId: zod_1.z.string().uuid(),
    providers: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.nativeEnum(model_enums_1.Provider),
        apiKey: zod_1.z.string().optional(),
    })),
    regions: zod_1.z.array(zod_1.z.string()),
    entitiesConfig: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())).optional(),
});
class AccountConfigurationSettingsDto extends (0, nestjs_zod_1.createZodDto)(exports.AccountConfigurationSettingsSchema) {
}
exports.AccountConfigurationSettingsDto = AccountConfigurationSettingsDto;
//# sourceMappingURL=account.scheme.js.map