import { PrismaService } from '@/prisma/prisma.service';
import { GetLlmCallsQueryDto } from '@/api/dtos-schemes/llm-calls.dto';
import { Prisma } from '@prisma/client';
export declare class LlmCallsOperations {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAccountLlmCalls(accountId: string, queryParams: GetLlmCallsQueryDto): Promise<{
        data: {
            accountId: string;
            status: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            region: string | null;
            provider: string;
            model: string;
            state: string | null;
            sources: Prisma.JsonValue[];
            usage: Prisma.JsonValue | null;
            promptId: string | null;
            topicId: string | null;
            timestamp: Date;
            scanId: string | null;
            country: string | null;
            city: string | null;
            taskId: string | null;
            purpose: string;
            response: string | null;
            jsonResponse: Prisma.JsonValue | null;
            brightdataJobId: string | null;
            s3Key: string | null;
            failedReason: string | null;
        }[];
        totalCount: number;
    }>;
}
