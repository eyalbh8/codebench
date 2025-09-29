import { CompetitorsOperations } from '@/api/operations/competitors.service';
import { Competitor } from '@prisma/client';
import { PopulatedAccount } from '@/types/api';
export declare class CompetitorsController {
    private readonly competitorsService;
    constructor(competitorsService: CompetitorsOperations);
    getAllCompetitors(account: PopulatedAccount): Promise<{
        accountId: string;
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        site: string | null;
        advantage: string | null;
    }[]>;
    createNewCompetitor(account: PopulatedAccount, competitor: Competitor): Promise<{
        accountId: string;
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        site: string | null;
        advantage: string | null;
    }>;
    updateCompetitorById(account: PopulatedAccount, competitorId: string, competitor: Competitor): Promise<{
        accountId: string;
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        site: string | null;
        advantage: string | null;
    }>;
    deleteCompetitorById(account: PopulatedAccount, competitorId: string): Promise<{
        accountId: string;
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        site: string | null;
        advantage: string | null;
    }>;
    deleteNomineeById(account: PopulatedAccount, nominee: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
