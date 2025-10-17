import { Router } from "express";
import { SubscriptionController } from "../controllers/SubscriptionController";
import { SubscriptionService } from "../services/SubscriptionService";
import { SubscriptionRepositroy } from "../repositories/SubscriptionRepository";

const router = Router();
const subscriptionRepository = new SubscriptionRepositroy();
const subscriptionService = new SubscriptionService(subscriptionRepository);
const subscriptionController = new SubscriptionController(subscriptionService);


router.post("/", subscriptionController.createSubscription.bind(subscriptionController));
router.get("/user/:userId", subscriptionController.getUserSubscriptions.bind(subscriptionController));
router.get("/:id/user/:userId", subscriptionController.getSubscriptionById.bind(subscriptionController));
router.delete("/:id/user/:userId", subscriptionController.cancelSubscription.bind(subscriptionController));
router.patch("/:id/user/:userId/auto-renew", subscriptionController.toggleAutoRenew.bind(subscriptionController));
router.get("/user/:userId/active", subscriptionController.getActiveSubscriptions.bind(subscriptionController));


export default router;
