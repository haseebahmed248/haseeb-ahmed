import { User } from "../entites/User";



export interface IUserRepositroy{
    create(data: {name: string, email: string, password: string}): Promise<User>;
}