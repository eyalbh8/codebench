import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DescopeService } from '../../auth/descope.service';
import { ConfigService } from '../../config/config.service';
import { PromptsService } from './prompts.service';
import { AccountError, NotFoundError } from '../../common/errors/app.error';
import { Prisma } from '@prisma/client';
import { User, UserTenant } from '../../types/api';

/**
 * Test suite for AccountsService
 * Tests account creation, retrieval, and update operations
 */
describe('AccountsService', () => {
  let service: AccountsService;

  type MockPrismaService = {
    account: {
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockPrismaService: MockPrismaService = {
    account: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(
      (callback: (prisma: MockPrismaService) => Promise<unknown>) =>
        callback(mockPrismaService),
    ),
  };

  const mockDescopeService = {
    createTenant: jest.fn(),
    updateUserTenants: jest.fn(),
    isUserTenantAdmin: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockPromptsService = {
    getPrompts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: DescopeService, useValue: mockDescopeService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PromptsService, useValue: mockPromptsService },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for account creation functionality
   * Verifies successful account creation and error handling for tenant operations
   */
  describe('createAccount', () => {
    const mockUser: User = {
      loginIds: ['test@example.com'],
      userId: '123',
      userTenants: [],
      createTime: Date.now(),
      TOTP: false,
      SAML: false,
      SCIM: false,
      password: false,
      status: 'active',
    };

    const mockAccountInput: Prisma.AccountCreateInput = {
      name: 'Test Account',
      domains: [],
    };

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'DEFAULT_ACCOUNT_SETTINGS_PROVIDERS':
            return 'provider1,provider2';
          case 'DEFAULT_ACCOUNT_SETTINGS_REGIONS':
            return 'region1,region2';
          case 'TENANT_ADMIN_ROLE':
            return 'Admin';
          case 'TENANT_ADMIN_ROLE_PERMISSIONS':
            return 'permission1,permission2';
          case 'TENANT_MEMBER_ROLE':
            return 'Member';
          case 'TENANT_MEMBER_ROLE_PERMISSIONS':
            return 'permission3,permission4';
          default:
            return '';
        }
      });
    });

    /**
     * Test: Should successfully create an account with default settings
     * Verifies that account creation includes provider and region configuration
     * and that tenant operations are called correctly
     */
    it('should create an account successfully', async () => {
      const mockCreatedAccount = {
        id: '123',
        name: 'Test Account',
        accountSettings: {
          providers: [{ name: 'provider1' }, { name: 'provider2' }],
          regions: ['region1', 'region2'],
        },
      };

      mockPrismaService.account.create.mockResolvedValue(mockCreatedAccount);
      mockDescopeService.createTenant.mockResolvedValue({});
      mockDescopeService.updateUserTenants.mockResolvedValue({});

      const result = await service.createAccount(mockAccountInput, mockUser);

      expect(result).toEqual(mockCreatedAccount);
      expect(mockDescopeService.createTenant).toHaveBeenCalled();
      expect(mockDescopeService.updateUserTenants).toHaveBeenCalled();
    });

    /**
     * Test: Should throw AccountError when tenant creation fails
     * Verifies proper error handling when Descope tenant creation fails
     */
    it('should throw AccountError when tenant creation fails', async () => {
      mockPrismaService.account.create.mockResolvedValue({
        id: '123',
        name: 'Test Account',
      });
      mockDescopeService.createTenant.mockRejectedValue(
        new Error('Tenant creation failed'),
      );

      await expect(
        service.createAccount(mockAccountInput, mockUser),
      ).rejects.toThrow(AccountError);
      await expect(
        service.createAccount(mockAccountInput, mockUser),
      ).rejects.toThrow('Failed to create tenant in authentication service');
    });

    /**
     * Test: Should throw AccountError when user tenant update fails
     * Verifies proper error handling when updating user tenant associations fails
     */
    it('should throw AccountError when user tenant update fails', async () => {
      mockPrismaService.account.create.mockResolvedValue({
        id: '123',
        name: 'Test Account',
      });
      mockDescopeService.createTenant.mockResolvedValue({});
      mockDescopeService.updateUserTenants.mockRejectedValue(
        new Error('User update failed'),
      );

      await expect(
        service.createAccount(mockAccountInput, mockUser),
      ).rejects.toThrow(AccountError);
      await expect(
        service.createAccount(mockAccountInput, mockUser),
      ).rejects.toThrow('Failed to update user tenants');
    });
  });

  /**
   * Test suite for account retrieval functionality
   * Verifies successful account retrieval and error handling for missing accounts
   */
  describe('getAccountById', () => {
    const mockAccountId = '123';
    const mockUser: User = {
      loginIds: ['test@example.com'],
      userId: '123',
      userTenants: [
        {
          tenantId: '123',
          tenantName: 'Test Account',
          roleNames: ['Admin'],
        },
      ],
      createTime: Date.now(),
      TOTP: false,
      SAML: false,
      SCIM: false,
      password: false,
      status: 'active',
    };

    /**
     * Test: Should return account when found
     * Verifies that existing accounts are retrieved correctly with their settings
     */
    it('should return account when found', async () => {
      const mockAccount = {
        id: mockAccountId,
        name: 'Test Account',
        accountSettings: {
          providers: [{ name: 'provider1' }],
        },
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockDescopeService.isUserTenantAdmin.mockReturnValue(true);

      const result = await service.getAccountById(mockAccountId, mockUser);

      expect(result).toEqual(mockAccount);
    });

    /**
     * Test: Should throw NotFoundError when account not found
     * Verifies proper error handling when attempting to retrieve a non-existent account
     */
    it('should throw NotFoundError when account not found', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(
        service.getAccountById(mockAccountId, mockUser),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.getAccountById(mockAccountId, mockUser),
      ).rejects.toThrow('Account not found');
    });
  });

  /**
   * Test suite for account update functionality
   * Verifies successful account updates and error handling for update failures
   */
  describe('updateAccount', () => {
    const mockAccountInput = {
      id: '123',
      name: 'Updated Account',
    };

    /**
     * Test: Should update account successfully
     * Verifies that account updates are applied correctly and return the updated account
     */
    it('should update account successfully', async () => {
      const mockUpdatedAccount = {
        id: '123',
        name: 'Updated Account',
        accountSettings: {
          providers: [{ name: 'provider1' }],
        },
      };

      mockPrismaService.account.update.mockResolvedValue(mockUpdatedAccount);

      const result = await service.updateAccount(mockAccountInput);

      expect(result).toEqual(mockUpdatedAccount);
    });

    /**
     * Test: Should throw AccountError when update fails
     * Verifies proper error handling when account update operation fails
     */
    it('should throw AccountError when update fails', async () => {
      mockPrismaService.account.update.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(service.updateAccount(mockAccountInput)).rejects.toThrow(
        AccountError,
      );
      await expect(service.updateAccount(mockAccountInput)).rejects.toThrow(
        'Failed to update account',
      );
    });
  });
});
