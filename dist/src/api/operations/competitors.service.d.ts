import { PrismaService } from '@/prisma/prisma.service';
import { Competitor } from '@prisma/client';
import { Nominee } from '../dtos-schemes/common.dto';
import { LlmService } from './llm/llm.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
export declare class CompetitorsOperations {
    private readonly prisma;
    private readonly llmService;
    private readonly logger;
    constructor(prisma: PrismaService, llmService: LlmService, logger: AppLogger);
    private readonly MIN_CANDIDATE_APPEARANCE_PERCENTAGE;
    getAllActiveCompetitors(account: PopulatedAccount): Promise<Competitor[]>;
    createNewCompetitor(account: PopulatedAccount, competitor: Competitor): Promise<Competitor>;
    updateCompetitorById(account: PopulatedAccount, competitorId: string, data: Partial<Competitor>): Promise<Competitor>;
    deleteCompetitorById(account: PopulatedAccount, competitorId: string): Promise<Competitor>;
    deleteNomineeByName(account: PopulatedAccount, nominee: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getAllNominees(account: PopulatedAccount): Promise<Nominee[]>;
    createSuggestedMergeEntitiesJob(account: PopulatedAccount, submittedBy: string): Promise<{
        message: string;
        id: string;
        type: string;
        status: string;
        createdAt: Date;
    }>;
    mergeNomineeBySiteUrl(account: PopulatedAccount, nominee: string, nomineeSiteUrl: string, entityName: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
