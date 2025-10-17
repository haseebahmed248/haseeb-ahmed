import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initDB } from './config/database.config';
import { ErrorHandler } from './shared/middleware/errorHandler';
import router from './modules/chat/routes/ChatRoutes';
import userRouter from 'modules/user/routes/UserRoutes';
import subscriptionRouter from './modules/subscriptions/routes/SubscriptionRoutes';
import { BillingService } from './modules/subscriptions/services/BillingService';


class App {
    public app: express.Application;
    public port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;
        initDB();
        this.initializeMiddlewares();
        this.initializeRoutes();
    }
    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        dotenv.config();
        this.app.use(ErrorHandler);
    }
    private initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.send('OK');
        }); 
        this.app.use('/chat',router)
        this.app.use('/auth',userRouter);
        this.app.use('/subscriptions',subscriptionRouter);
    }
    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
            this.startCronJobs();
        });
    }

    private startCronJobs() {
        const billingService = new BillingService();
        console.log(`Running Corn Job....`)
        billingService.processAllRenewals();
        billingService.retryFailedPayments();

        setInterval(async () => {
            await billingService.processAllRenewals();
        }, 24 * 60 * 60 * 1000);

        setInterval(async () => {
            await billingService.retryFailedPayments();
        }, 60 * 60 * 1000);
    }
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = new App(port);
app.listen();

export default App;