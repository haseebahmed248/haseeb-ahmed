import { NextFunction, Request, Response } from "express";
import { SubscriptionService } from "../services/SubscriptionService";

export class SubscriptionController{
    constructor(
        private subscriptionService: SubscriptionService
    ){}
    
    async createSubscription(req: Request, res: Response, next: NextFunction){
        try {
           if(!req.body.userId || !req.body.tier || !req.body.billingCycle){
            res.status(400).json({
                "error": 'Bad Request',
                "message": "userId, tier, billingCycle are required"
            })
            return;
           }
            const subscription = await this.subscriptionService.createSubscription(req.body);
            res.status(201).json({
                success: true,
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserSubscriptions(req: Request, res: Response, next:  NextFunction){
        try {
            const { userId } = req.params;
            if(!userId){
                res.status(400).json({
                    "error":"Bad Request",
                    "message": "userId is required"
                })
                return;
            }
            const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);
            res.status(200).json({
                success: true,
                data: subscriptions
            });
        } catch (error) {
            next(error)
        }
    }

    async getSubscriptionById(req: Request, res: Response, next: NextFunction){
        try {
            const { id, userId } = req.params;
            if(!id || !userId){
                res.status(400).json({
                    "error":"Bad Request",
                    "message":"id and userId are required"
                })
                return;
            }
            const subscription = await this.subscriptionService.getSubscriptionById(id, userId);
            if(!subscription){
                res.status(404).json({ error: "Subscription not found" });
                return;
            }
            res.status(200).json(subscription);
        } catch (error) {
            next(error)
        }
    }

    async cancelSubscription(req: Request, res: Response, next: NextFunction){
        try {
            const { id, userId } = req.params;
            if(!id || !userId){
                res.status(400).json({
                    "error":"Bad Request",
                    "message":"id and userId are required"
                })
                return;
            }
            const subscription = await this.subscriptionService.cancelSubscription(id, userId);
            if(!subscription){
                res.status(404).json({ error: "Subscription not found" });
                return;
            }
            res.status(200).json(subscription);
        } catch (error) {
            next(error)
        }
    }

    async toggleAutoRenew(req: Request, res: Response, next: NextFunction){
        try {
            const { id, userId } = req.params;
            const { enabled } = req.body;
            if(!id || !userId || enabled === undefined){
                res.status(400).json({
                    "error":"Bad Request",
                    "message":"id, userId and enabled are required"
                })
                return;
            }
            const subscription = await this.subscriptionService.toggleAutoRenew(id, userId, enabled);
            if(!subscription){
                res.status(404).json({ error: "Subscription not found" });
                return;
            }
            res.status(200).json(subscription);
        } catch (error) {
            next(error)
        }
    }

    async getActiveSubscriptions(req: Request, res: Response, next: NextFunction){
        try {
            const { userId } = req.params;
            if(!userId){
                res.status(400).json({
                    "error":"Bad Request",
                    "message":"userId is required"
                })
                return;
            }
            const subscriptions = await this.subscriptionService.getActiveSubscriptions(userId);
            res.status(200).json(subscriptions);
        } catch (error) {
            next(error)
        }
    }
}