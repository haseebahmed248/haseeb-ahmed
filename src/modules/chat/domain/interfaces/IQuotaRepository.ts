import { QuotaInfo } from "../entities/QuotaInfo";

export interface IQuotaRepository{
    getUserQuota(userId: string): Promise<QuotaInfo>;
    deductFreeMessage(userId: string): Promise<void>;
    deductSubscriptionMessage(userId: string): Promise<void>;
    resetMonthlyQuota(userId: string): Promise<void>;
    checkAndResetIfNeeded(userId: string): Promise<void>;
}