import { db } from "config/database.config";
import { User } from "../domain/entites/User";
import { IUserRepositroy } from "../domain/interfaces/IUserRepository";
import { HashPassword } from "shared/utils/utils";



export class UserRepository implements IUserRepositroy{
    async findByEmail(email: string): Promise<User | null>{
        const user = await db.user.findUnique({
            where: { email }
        });
        return user;
    }

    async create(data: {
        name: string,
        email: string,
        password: string
    }): Promise<User>{
        const passwordHash = await HashPassword(data.password)
        const user = await db.user.create({
            data:{
                name: data.name,
                email: data.email,
                password: passwordHash
            }
        })
        return user;
    }
}