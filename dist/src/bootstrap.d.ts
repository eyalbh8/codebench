import express from 'express';
export declare function bootstrapApp(expressInstance?: express.Express): Promise<{
    app: import("@nestjs/common").INestApplication<any>;
    expressApp: express.Express;
}>;
