import { Request, Response, NextFunction } from "express";
import { Userservice } from "../services/UserService";



export class UserController {
    constructor(
        private userService: Userservice
    ){}

    create = async(req: Request, res:Response, next: NextFunction)=>{
        try {
            const {name, email, password} = req.body;
            if(!name|| !email|| !password){
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Name, Email and Password are required'
                })
                return;
            }            

            const user = await this.userService.create({
                name: name,
                email: email,
                password: password
            });

            res.status(201).json({
                success: true,
                data: user
            })
        } catch (error) {
            next(error)
        }
    }
}