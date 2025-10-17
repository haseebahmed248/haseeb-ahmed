import { IChatRepository } from "../domain/interfaces/IChatRepository";
import { db } from "config/database.config";
import { ChatMessage } from "../domain/entities/ChatMessage";


export class ChatRepository implements IChatRepository {

    async create(message: ChatMessage) {
        const created = await db.chatMessage.create({
            data: {
                userId: message.userId,
                question: message.question,
                answer: message.answer,
                tokens: message.tokens
            }
        })
        return new ChatMessage(created);
    }

    async findByUserId(userId: string, limit: number = 50): Promise<ChatMessage[]> {
        const messages = await db.chatMessage.findMany({
            where: {
                userId: userId
            }
        })

        return messages.map(
            (msg) =>
                new ChatMessage({
                    id: msg.id,
                    userId: msg.userId,
                    question: msg.question,
                    answer: msg.answer,
                    tokens: msg.tokens,
                    createdAt: msg.createdAt,
                })
        );
    }

    async countByUserAndMonth(userId: string, year: number, month: number): Promise<number>{
        const startDate = new Date(year, month -1, 1);
        const endDate = new Date(year, month, 1);

        const count = await db.chatMessage.count({
            where:{
                userId: userId,
                createdAt: {
                    gte: startDate,
                    lt: endDate
                }
            }
        })
        return count;
    }

}