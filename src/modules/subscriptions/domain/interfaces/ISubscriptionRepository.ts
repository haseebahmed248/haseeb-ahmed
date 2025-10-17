
import { BillingCycle, Subscription, SubscriptionTier } from "../entities/subscription";


export interface CreateSubscriptionDTO{
    userId: string;
    tier: SubscriptionTier;
    billingCycle: BillingCycle;
    autoRenew?: boolean
}

export interface UpdateSubscriptionDTO{
    autoRenew?: boolean;
    isActive: boolean;
    usedMessages?: number;
    renewalDate: Date| null;
}

export interface ISubscriptionRepository{
    create(data: CreateSubscriptionDTO): Promise<Subscription>;
    findById(id: string): Promise<Subscription| null>;
    findByUserId(userId: string): Promise<Subscription[]>;
    findActiveByUserId(userId: string): Promise<Subscription[]>;
    findSubscriptionsNeedingRenewal(userId: string): Promise<Subscription[]>;
    update(id: string, data:UpdateSubscriptionDTO): Promise<Subscription>;
    cancel(id: string): Promise<Subscription>
    deactivate(id: string): Promise<Subscription>  
    renew(id: string, newStartDate: Date, newEndDate:Date):Promise<Subscription>
    hasActiveSubscription(userId: string, tier: SubscriptionTier): Promise<Boolean>
    getSubscriptionWithMostQuota(userId: string):Promise<Subscription| null>

}