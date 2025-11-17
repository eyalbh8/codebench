"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function bootstrap() {
    const prisma = new client_1.PrismaClient();
    try {
        await prisma.$connect();
        console.log('Connected to database');
        console.log('Database bootstrap complete');
    }
    catch (error) {
        console.error('Error bootstrapping database:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
void bootstrap();
//# sourceMappingURL=prisma-bootstrap.js.map