import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initDB } from './config/database.config';


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
    }
    private initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.send('OK');
        }); 
    }
    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = new App(port);
app.listen();

export default App;