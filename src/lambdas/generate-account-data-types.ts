// Type definitions for generate-account-data lambda (lambda removed, types kept for compatibility)
export interface GenerateAccountDataEvent {
  jobId: string;
  userEmail: string;
  accountId: string;
}

export interface GenerateAccountDataRequestContext {
  accountId: string;
  userEmail?: string;
  region?: string;
  language?: string;
}

export interface CreateOnboardAccountEvent {
  isAdminCreated: boolean;
}

