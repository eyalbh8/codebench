import { PopulatedAccount } from '@/types/api';
import { GetLlmCallsQueryDto } from '@/api/dtos-schemes/llm-calls.dto';
import { LlmCallsOperations } from '@/api/operations/llm-calls.operations';
export declare class AccountLlmCallsController {
    private readonly llmCallsService;
    constructor(llmCallsService: LlmCallsOperations);
    getLlmCalls(account: PopulatedAccount, queryParams: GetLlmCallsQueryDto): Promise<{
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
            sources: import("@prisma/client/runtime/library").JsonValue[];
            usage: import("@prisma/client/runtime/library").JsonValue | null;
            promptId: string | null;
            topicId: string | null;
            timestamp: Date;
            scanId: string | null;
            country: string | null;
            city: string | null;
            taskId: string | null;
            purpose: string;
            response: string | null;
            jsonResponse: import("@prisma/client/runtime/library").JsonValue | null;
            brightdataJobId: string | null;
            s3Key: string | null;
            failedReason: string | null;
        }[];
        totalCount: number;
    }>;
}
