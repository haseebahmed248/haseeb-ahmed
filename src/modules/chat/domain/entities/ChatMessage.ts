

export class ChatMessage {
    id: string;
    userId: string;
    question: string;
    answer: string;
    tokens: number;
    createdAt: Date;


    constructor(data: {
        id?: string;
        userId: string;
        question: string;
        answer: string;
        tokens: number;
        createdAt: Date
    }) {
        this.id = data.id || '';
        this.userId = data.userId;
        this.question = data.question;
        this.answer = data.answer;
        this.tokens = data.tokens;
        this.createdAt = data.createdAt;
    }

    isRecent(): boolean{
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return this.createdAt > hourAgo;
    }
}
