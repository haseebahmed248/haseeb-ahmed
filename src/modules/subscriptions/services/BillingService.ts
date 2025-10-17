import { db } from "../../../config/database.config"
import { addMonths, addYears, isToday, sub, subDays } from "date-fns";
import { BillingCycle, Subscription, SubscriptionTier } from "../domain/entities/subscription";


export class BillingService {
//   - processAllRenewals() // Main method called by cron
    async processAllRenewals(): Promise<void> {
        const all = await db.subscription.findMany({
            where: {
                isActive: true,
                autoRenew: true
            }
        });

        const today = new Date();
        const toRenew = all.filter(s =>
            !s.renewalDate || isToday(s.renewalDate) || s.renewalDate <= today
        );

        // run renewals in parallel
        await Promise.all(toRenew.map(s => this.renewSubscription(s.id)));
    }

    private async renewSubscription(subscriptionId: string){
        const subscription = await db.subscription.findFirst({
            where:{
                id: subscriptionId
            }
        })
        if(!subscription) return;
        if(
            (subscription.renewalDate!== null && !isToday(subscription.renewalDate))
            ||
            (subscription.autoRenew === false)
        ){
            return;
        }
         const success = await this.simulatePayment();
         const subscriptionConvert = this.toDomainEntity(subscription)
        if (success) {
            await this.handlePaymentSuccess(subscriptionConvert);
        } else {
            await this.handlePaymentFailure(subscriptionConvert);
        }
    }

    private async simulatePayment(): Promise<boolean> {
        const delay = 1000 + Math.random() * 2000;
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.25; // 75% success chance
                resolve(success);
            }, delay);
        });
    }

    private async handlePaymentSuccess(subscription: Subscription): Promise<boolean> {
        const now = new Date();
        let newEndDate: Date;
        switch (subscription.billingCycle) {
            case "YEARLY":
                newEndDate = addYears(now, 1);
                break;
            case "MONTHLY":
            default:
                newEndDate = addMonths(now, 1);
                break;
        }

        await db.subscription.update({
            where: { id: subscription.id },
            data: {
                startDate: now,
                endDate: newEndDate,
                lastBillingDate: now,
                renewalDate: newEndDate,
                isActive: true
            }
        });

        return true;
    }

    private async handlePaymentFailure(subscription: Subscription): Promise<boolean>{
        await db.subscription.update({
            where: { id: subscription.id },
            data: {
                isActive: false
            }
        });
        return false;
    }

    async retryFailedPayments(retryWindowDays = 3): Promise<void> {
        const cutoff = subDays(new Date(), retryWindowDays);

        const failed = await db.subscription.findMany({
            where: {
                isActive: false,
                autoRenew: true,
                renewalDate: {
                    gte: cutoff
                }
            }
        });

        // sequential retries to avoid spamming payment gateway
        for (const s of failed) {
            const subscriptionConvert = this.toDomainEntity(s);
            const success = await this.simulatePayment();
            if (success) {
                await this.handlePaymentSuccess(subscriptionConvert);
            } else {
                await this.handlePaymentFailure(subscriptionConvert);
            }
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