;
import { QuotaError } from "shared/utils/error";
import { ChatMessage } from "../domain/entities/ChatMessage";
import { IChatRepository } from "../domain/interfaces/IChatRepository";
import { IQuotaRepository } from "../domain/interfaces/IQuotaRepository";




export class ChatService {
    constructor(
        private chatRepositroy: IChatRepository, 
        private quotaRepository: IQuotaRepository
    ){}

    async sendMessage(userId: string, question: string): Promise<ChatMessage>{
        const quota = await this.quotaRepository.getUserQuota(userId);
        console.log(`send message Quota: ${quota}`);
        if(!quota.canSendMessage()){
            throw new QuotaError(
                'Message Quota Exceeded. Please upgrade your subscription.'
            )
        }

        const {answer, tokens} = await this.mockAIResponse(question)

        await this.deducateQuota(userId, quota);

        return new ChatMessage({
            answer: answer,
            question: question,
            userId: userId,
            tokens: tokens,
            createdAt: new Date()
        })
    }

    async getUserMessages(userId: string, limit: number): Promise<ChatMessage[]>{
        return await this.chatRepositroy.findByUserId(userId, limit)
    }

    async getUserQuota(userId: string){
        return await this.quotaRepository.getUserQuota(userId);
    }

    async deducateQuota(userId: string, quota: any): Promise<void>{
        console.log(`Quota Unlimited: ${quota.hasUnlimited},
        Quota Free: ${quota.freeMessagesRemaining}
        Quota Subscription: ${quota.subscriptionMessagesRemaining}`)
        if(quota.hasUnlimited){
            await this.quotaRepository.deductSubscriptionMessage(userId);
            return;
        }
        if(quota.freeMessagesRemaining > 0){
            await this.quotaRepository.deductFreeMessage(userId);
            return;
        }
        if(quota.subscriptionMessagesRemaining > 0){
            await this.quotaRepository.deductSubscriptionMessage(userId);
            return;
        }
        console.log(`deducation quota: none`)
    }

    async mockAIResponse(question: string): Promise<{answer: string, tokens: number}>{
        // simulate delay of 2-3seconds
        const delay = 1000 + Math.random()* 2000;
        await new Promise((resolve)=> setTimeout(resolve, delay))
        const answer = `This is a Mock AI Response to the question: ${question}`
        
        const tokens = Math.floor(question.length+answer.length/4);

        return { answer, tokens};
    }
}