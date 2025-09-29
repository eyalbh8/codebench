import { AuthRequest, PopulatedAccount } from '@/types/api';
import { NewUserCreationRequestDto, UserAccountDetachmentRequestDto, UserAccountAttachmentRequestDto } from '@/api/dtos-schemes/user.dto';
import { UsersService } from '@/api/operations/users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createNewUser(req: AuthRequest, body: NewUserCreationRequestDto): Promise<{
        userAccounts: {
            userId: string;
            accountId: string;
            roles: string[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            lastInsightsVisit: Date | null;
        }[];
    } & {
        name: string | null;
        id: string;
        email: string;
        lastName: string | null;
        isSystemAdmin: boolean;
        isAgency: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeUserById(req: AuthRequest, body: UserAccountDetachmentRequestDto): Promise<void>;
    addTeamMemberToAccount(account: PopulatedAccount, body: UserAccountAttachmentRequestDto): Promise<void>;
}
