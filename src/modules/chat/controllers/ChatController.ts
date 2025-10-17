import { NextFunction, Request, Response } from "express";
import { ChatService } from "../services/ChatService";



export class ChatController {
    constructor(private chatService: ChatService){}

    sendMessage = async(req:Request, res: Response, next: NextFunction): Promise<void> =>{
        try {
            const { userId, question } = req.body;
            if(!userId || !question){
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'userId and question are required'
                })
                return;
            }

            const message = await this.chatService.sendMessage(userId, question);

            res.status(201).json({
                success: true,
                data: {
                    id: message.id,
                    question: message.question,
                    answer: message.answer,
                    tokens: message.tokens,
                    createdAt: message.createdAt
                }
            })
        } catch (error) {
            next(error) //pass to error handler middleware
        }
    }

    getUserMessage = async(req: Request, res: Response, next: NextFunction): Promise<void>=>{
        try {
            const {userId} = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit as string): 50;
            if(!userId){
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'UserId is required'
                })
                return;
            }
            const messages = await this.chatService.getUserMessages(userId, limit);

            res.status(200).json({
                success: true,
                data: messages
            })
        } catch (error) {
            next(error)
        }
    }

    getUserQuota = async(req: Request, res: Response, next: NextFunction): Promise<void>=>{
        try {
            const {userId} = req.params;
            if(!userId){
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'UserId is required'
                })
                return;
            }
            const quota = await this.chatService.getUserQuota(userId)

            res.status(200).json({
                success: true,
                data: quota
            })
        } catch (error) {
            next(error)
        }
    }
}