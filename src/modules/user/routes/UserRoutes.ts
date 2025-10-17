import { Router } from "express";
import { Userservice } from "../services/UserService";
import { UserController } from "../controller/UserController";
import { UserRepository } from "../repositories/UserRepository";


const userRouter = Router()


const userRepository = new UserRepository()
const userService = new Userservice(userRepository)
const userController = new UserController(userService)

userRouter.post('/register', userController.create);

export default userRouter;