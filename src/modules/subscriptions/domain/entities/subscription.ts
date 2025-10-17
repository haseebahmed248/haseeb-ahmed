
export enum SubscriptionTier{
    BASIC = 'BASIC',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE'
}

export enum BillingCycle {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
}


export class Subscription{
    id: string;
    userId: string;
    tier: SubscriptionTier;
    maxMessages: number;
    usedMessages: number;
    price: number;
    billingCycle: BillingCycle;
    autoRenew: boolean;
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    renewalDate: Date | null;
    lastBillingDate: Date;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: {
        id?: string;
        userId: string;
        tier: SubscriptionTier;
        maxMessages: number;
        usedMessages: number;
        price: number;
        billingCycle: BillingCycle;
        autoRenew: boolean;
        isActive: boolean;
        startDate: Date;
        endDate: Date;
        renewalDate: Date;
        lastBillingDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }){
        this.id = data.id || ''
        this.userId = data.userId
        this.tier = data.tier
        this.maxMessages = data.maxMessages
        this.usedMessages = data.usedMessages ?? 0
        this.price = data.price
        this.billingCycle = data.billingCycle
        this.autoRenew = data.autoRenew ?? true
        this.isActive = data.isActive
        this.startDate = data.startDate
        this.endDate = data.endDate
        this.renewalDate = data.renewalDate
        this.lastBillingDate = data.lastBillingDate
        this.createdAt = new Date();
        this.updatedAt = new Date()
    }

    isCurrentlyActive(): boolean{
        const now = new Date()
        return this.isActive  && this.endDate >= now;
    }

    hasExpired(): boolean{
        const now = new Date()
        return this.endDate < now;
    }

    isUnlimited(): boolean{
        return this.tier === SubscriptionTier.ENTERPRISE;
    }

    getRemaningMessages(): number{
        if(this.isUnlimited()){
            return -1;
        }
        return Math.max(0, this.maxMessages - this.usedMessages);
    }

    canSendMessage(): boolean{
        if(!this.isCurrentlyActive()){
            return false;
        }else if(this.isUnlimited()){
            return true;
        }
        return this.getRemaningMessages() > 0;
    }

    needsRenewal(): boolean{
        if(!this.autoRenew || !this.renewalDate){
            return false;
        }
        return new Date >= this.renewalDate;    
    }

    getUsagesPercentage(): number{
        if(this.isUnlimited()){
            return 0;
        }
        return (this.usedMessages/this.maxMessages)* 100;
    }

    cancel(): void{
        this.autoRenew = false;
        this.renewalDate = null;
    }

    deactivate():void{
        this.isActive = false
        this.autoRenew = false;
    }

    getRemaningDays(): number{
        const now = new Date()
        const diffTime = this.endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime/(1000*60*60*24));
        return Math.max(0,diffDays);
    }

    renew(newStartDate: Date, newEndDate:Date): void{
        this.startDate = newStartDate;
        this.endDate = newEndDate;
        this.usedMessages = 0;
        this.lastBillingDate = new Date()
        this.isActive = true

        if(this.autoRenew){
            this.renewalDate = newEndDate;
        }
    }
}