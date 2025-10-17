

export class QuotaInfo {
    freeMessagesRemaining: number;
    subscriptionMessagesRemaining: number;
    hasUnlimited: boolean;

    constructor(freeMessagesRemaining: number, subscriptionMessagesRemaining: number, hasUnlimited: boolean) {
        this.freeMessagesRemaining = freeMessagesRemaining;
        this.subscriptionMessagesRemaining = subscriptionMessagesRemaining;
        this.hasUnlimited = hasUnlimited;
    }

    canSendMessage(): boolean {
        return this.freeMessagesRemaining > 0 || this.subscriptionMessagesRemaining > 0 || this.hasUnlimited;
    }

    getTotalRemaining(): number {
        if (this.hasUnlimited){
            return Infinity;
        }
        return this.freeMessagesRemaining + this.subscriptionMessagesRemaining;
    }
}