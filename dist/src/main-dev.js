"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("./bootstrap");
async function bootstrap() {
    const { app } = await (0, bootstrap_1.bootstrapApp)();
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger UI available at: http://localhost:${port}/swagger-json`);
}
void bootstrap();
//# sourceMappingURL=main-dev.js.map