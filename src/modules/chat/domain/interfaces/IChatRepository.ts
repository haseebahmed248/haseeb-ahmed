import { ChatMessage } from "../entities/ChatMessage";

export interface IChatRepository {
    create(message: ChatMessage): Promise<ChatMessage>;
    findByUserId(userId: string, limit: number): Promise<ChatMessage[]>;
    countByUserAndMonth(userId: string, year: number, month: number): Promise<number>;
}