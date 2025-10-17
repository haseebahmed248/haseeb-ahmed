import { db } from "config/database.config";
import { BillingCycle, Subscription, SubscriptionTier } from "../domain/entities/subscription";
import { CreateSubscriptionDTO, ISubscriptionRepository, UpdateSubscriptionDTO } from "../domain/interfaces/ISubscriptionRepository";
import { addMonths, addYears } from "date-fns";



export class SubscriptionRepositroy implements ISubscriptionRepository {
    async create(data: CreateSubscriptionDTO): Promise<Subscription> {
        const subscriptionDetails = this.calcualteSubscriptionDetails(data.tier, data.billingCycle);

        //Calculate Dates
        const startDate = new Date()
        const endDate = this.calculateEndDate(startDate, data.billingCycle);
        const renewalDate = data.autoRenew !== false ? endDate : null;

        const created = await db.subscription.create({
            data: {
                userId: data.userId,
                tier: data.tier,
                billingCycle: data.billingCycle,
                usedMessages: 0,
                maxMessages: subscriptionDetails.maxMessages,
                price: subscriptionDetails.price,
                startDate: startDate,
                endDate: endDate,
                renewalDate: renewalDate,
                isActive: true,
                autoRenew: data.autoRenew !== false,
                lastBillingDate: startDate
            }
        })
        return this.toDomainEntity(created);
    }


    async findById(id: string): Promise<Subscription | null> {
        const subscription = await db.subscription.findFirst({
            where: {
                id: id
            }
        })
        if (!subscription) return null;
        return this.toDomainEntity(subscription);
    }
    async findByUserId(userId: string): Promise<Subscription[]> {
        const subscription = await db.subscription.findMany({
            where: {
                userId: userId
            }
        })
        return subscription.map(
            (sub) => this.toDomainEntity(sub)
        )
    }
    async findActiveByUserId(userId: string): Promise<Subscription[]> {
        const subscription = await db.subscription.findMany({
            where: {
                userId: userId,
                isActive: true
            }
        })
        return subscription.map(
            (sub) => this.toDomainEntity(sub)
        )
    }
    async findSubscriptionsNeedingRenewal(userId: string): Promise<Subscription[]> {
        const now = new Date();
        const subscriptions = await db.subscription.findMany({
            where: {
                autoRenew: true,
                renewalDate: {
                    lte: now
                },
                isActive: true
            }
        })
        return subscriptions.map((sub) => this.toDomainEntity(sub));
    }
    async update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
        const updated = await db.subscription.update({
            where: { id: id },
            data: {
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.renewalDate !== undefined && { renewalDate: data.renewalDate }),
                ...(data.autoRenew !== undefined && { autoRenew: data.autoRenew }),
                ...(data.usedMessages !== undefined && { usedMessages: data.usedMessages }),
            }
        })
        return this.toDomainEntity(updated);
    }
    async cancel(id: string): Promise<Subscription> {
        const subscription = await db.subscription.update({
            where: { id: id },
            data: {
                autoRenew: false,
                renewalDate: null,
            }
        })
        return this.toDomainEntity(subscription);
    }
    async deactivate(id: string): Promise<Subscription> {
        const subscription = await db.subscription.update({
            where: {
                id: id
            },
            data: {
                isActive: false,
                autoRenew: false,
                endDate: new Date(),
                renewalDate: null,

            }
        })
        return this.toDomainEntity(subscription);
    }
    async renew(id: string, newStartDate: Date, newEndDate: Date): Promise<Subscription> {
        const newSub = await db.subscription.update({
            where: {
                id: id
            },
            data: {
                isActive: true,
                startDate: newStartDate,
                endDate: newEndDate,
                usedMessages: 0,
                renewalDate: newEndDate,
                lastBillingDate: newStartDate,
                updatedAt: new Date()
            }
        })
        return this.toDomainEntity(newSub);
    }
    async hasActiveSubscription(userId: string, tier: SubscriptionTier): Promise<boolean> {
        const hasActive = await db.subscription.findFirst({
            where: {
                userId: userId,
                tier: tier,
                isActive: true
            }
        })
        return hasActive !== null;
    }
    async getSubscriptionWithMostQuota(userId: string): Promise<Subscription | null> {
        const subscriptions = await db.subscription.findMany({
            where: {
                userId: userId,
                isActive: true,
                endDate: { gte: new Date() }
            }
        });

        if (subscriptions.length === 0) return null;

        // Calculate remaining and find max
        const withRemaining = subscriptions.map(sub => ({
            subscription: sub,
            remaining: sub.tier === 'ENTERPRISE'
                ? Infinity
                : sub.maxMessages - sub.usedMessages
        }));

        const best = withRemaining.reduce((max, current) =>
            current.remaining > max.remaining ? current : max
        );

        return this.toDomainEntity(best.subscription);
    }

    private calcualteSubscriptionDetails(
        tier: SubscriptionTier,
        billingCycle: BillingCycle
    ): { maxMessages: number, price: number } {
        let maxMessages: number;
        let basePrice: number;

        switch (tier) {
            case SubscriptionTier.BASIC:
                maxMessages = 10;
                basePrice = 9.99;
                break;
            case SubscriptionTier.PRO:
                maxMessages = 100;
                basePrice = 19.99;
                break;
            case SubscriptionTier.ENTERPRISE:
                maxMessages = Infinity
                basePrice = 99.99
                break;
            default:
                throw new Error(`Unknow Subscription Tier:${tier}`);
        }

        const price = billingCycle === BillingCycle.YEARLY ?
            basePrice * 12 * 0.8 //20% discount
            : basePrice

        return { maxMessages, price };
    }

    calculateEndDate(startDate: Date, billingCycle: BillingCycle): Date {
        if (billingCycle === BillingCycle.MONTHLY) {
            return addMonths(startDate, 1);
        } else {
            return addYears(startDate, 1);
        }
    }

    private toDomainEntity(data: any): Subscription {
        return new Subscription({
            id: data.id,
            userId: data.userId,
            tier: data.tier as SubscriptionTier,
            maxMessages: data.maxMessages,
            usedMessages: data.usedMessages,
            price: data.price,
            billingCycle: data.billingCycle as BillingCycle,
            autoRenew: data.autoRenew,
            isActive: data.isActive,
            startDate: data.startDate,
            endDate: data.endDate,
            renewalDate: data.renewalDate,
            lastBillingDate: data.lastBillingDate,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        })
    }
}