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
