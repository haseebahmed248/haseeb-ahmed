import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { ChatService } from "../services/ChatService";
import { ChatRepository } from "../repositories/ChatRepository";
import { QuotaRepository } from "../repositories/QuotaRepository";


const router = Router()

//Initlization
const chatRespositry = new ChatRepository()
const quotaRepository = new QuotaRepository()
const chatService = new ChatService(chatRespositry, quotaRepository)
const chatController = new ChatController(chatService)

//Routes 
router.post('/message', chatController.sendMessage);
router.get('/messages/:userId', chatController.getUserMessage)
router.get('/quota/:userId', chatController.getUserQuota)

export default router;