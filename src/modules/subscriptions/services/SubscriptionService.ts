import { Subscription } from "../domain/entities/subscription";
import { CreateSubscriptionDTO } from "../domain/interfaces/ISubscriptionRepository";
import { SubscriptionRepositroy } from "../repositories/SubscriptionRepository";


export class SubscriptionService {
    constructor(
        private subscriptionRepository: SubscriptionRepositroy
    ){}
    async createSubscription(data: CreateSubscriptionDTO): Promise<Subscription | null>{
        const checkDuplicate = await this.subscriptionRepository.findByUserId(data.userId);
        const existing = checkDuplicate.find(sub => sub.tier === data.tier);
        if(existing){
            throw new Error(`User already has an active ${data.tier} subscription`);
        }
        const subscription = await this.subscriptionRepository.create(data);
        return subscription;
    }
    async getUserSubscriptions(userId: string): Promise<Subscription[]>{
        const subscriptions = await this.subscriptionRepository.findByUserId(userId);
        return subscriptions;
    }
    async getSubscriptionById(id: string, userId: string): Promise<Subscription | null>{
        const checkSubscription = await this.subscriptionRepository.findByUserId(userId)
        const target = checkSubscription.find(sub => sub.id === id);
        if(!target) return null;
        const subscription = await this.subscriptionRepository.findById(id);
        return subscription;
    }
    async cancelSubscription(id: string, userId: string): Promise<Subscription | null>{
        const checkSubscription = await this.subscriptionRepository.findByUserId(userId);
        const target = checkSubscription.find(sub => sub.id === id);
        if(!target) return null;
        const cancel = await this.subscriptionRepository.cancel(id)
        return cancel
    }
    async toggleAutoRenew(id: string, userId: string, enabled: boolean): Promise<Subscription| null>{
        const checkSubscription = await this.subscriptionRepository.findByUserId(userId)
        const target = checkSubscription.find( sub => sub.id === id)
        if(!target) return null;
        const updatedData = { ...target, autoRenew: enabled}
        const autoRenew = await this.subscriptionRepository.update(id,updatedData);
        return autoRenew;
    }
    async getActiveSubscriptions(userId: string): Promise<Subscription[]>{
        const subscriptions = await this.subscriptionRepository.findByUserId(userId);
        return subscriptions;
    }
}