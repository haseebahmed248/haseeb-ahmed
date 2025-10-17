import { db } from "config/database.config";
import { QuotaInfo } from "../domain/entities/QuotaInfo";
import { IQuotaRepository } from "../domain/interfaces/IQuotaRepository";
import { isAfter, startOfMonth, sub } from "date-fns";


export class QuotaRepository implements IQuotaRepository{
    private FREE_MESSAGES_PER_MONTH: number = 3;

    async getUserQuota(userId: string): Promise<QuotaInfo>{

        await this.ensureQuotaExsists(userId);
        await this.checkAndResetIfNeeded(userId);

        const quota = await db.userQuota.findFirst({
            where: {
                userId: userId
            }
        })

        const subscription = await db.subscription.findMany({
            where: {
                userId,
                isActive: true,
                endDate: {gte: new Date()}
            },
            orderBy: { usedMessages: 'asc'}
        })

        const hasUnlimited = subscription.some(
            (sub)=> sub.tier === "ENTERPRISE"
        )
        let subscriptionMessagesRemaining = 0;
        if(!hasUnlimited){
            subscriptionMessagesRemaining = subscription.reduce((sum,sub)=>{
                const remaning = sub.maxMessages - sub.usedMessages;
                return sum + (remaning > 0? remaning: 0)
            }, 0)
        }

        const freeMessagesRemaining = this.FREE_MESSAGES_PER_MONTH - (quota?.freeMessagesUsed || 0)


        return new QuotaInfo(
            freeMessagesRemaining,
            subscriptionMessagesRemaining,
            hasUnlimited
        );
    }

    async deductFreeMessage(userId: string): Promise<void> {
        await db.userQuota.update({
            where: { userId},
            data: {
                freeMessagesUsed: {increment: 1}
            }
        })
    }

    async deductSubscriptionMessage(userId: string): Promise<void> {
        const subscription = await db.subscription.findFirst({
            where: { 
                userId,
                isActive: true,
                endDate: {gte: new Date() },
                OR: [
                    { tier: 'ENTERPRISE'},
                    { usedMessages: { lt: db.subscription.fields.maxMessages }}
                ]
            },
            orderBy: [
                { tier: 'desc'},
                { usedMessages: 'asc' }
            ]
        })
        if(!subscription){
            throw new Error("No Valid Subscription Found")
        }
        await db.subscription.update({
            where: { id: subscription.id},
            data: {
                usedMessages: { increment: 1}
            }
        })
    }

    async resetMonthlyQuota(userId: string): Promise<void> {
        await db.userQuota.update({
            where: {userId},
            data: {
                freeMessagesUsed: 0,
                lastResetDate: new Date()
            }
        })
    }

    async checkAndResetIfNeeded(userId: string): Promise<void>{
        const quota = await db.userQuota.findFirst({
            where:{
                userId: userId
            }
        })
        if(!quota) return
        const currentMonthAfter = startOfMonth(new Date());
        const lastResetDate = startOfMonth(quota.lastResetDate);

        if(isAfter(currentMonthAfter, lastResetDate)){
            await this.resetMonthlyQuota(userId)
        }
    }

    async ensureQuotaExsists(userId: string): Promise<void>{
        const exsists = await db.userQuota.findFirst({
            where: {
                userId: userId
            }
        })
        if(!exsists){
            await db.userQuota.create({
                data:{
                    userId: userId
                }
            })
        }
    }
}