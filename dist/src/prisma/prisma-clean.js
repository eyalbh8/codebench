"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function clean() {
    const prisma = new client_1.PrismaClient();
    await prisma.account.deleteMany();
    await prisma.accountSettings.deleteMany();
    await prisma.competitor.deleteMany();
    await prisma.prompt.deleteMany();
    await prisma.topic.deleteMany();
}
void clean();
//# sourceMappingURL=prisma-clean.js.map