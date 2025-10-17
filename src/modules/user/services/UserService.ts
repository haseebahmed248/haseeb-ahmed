import { User } from "../domain/entites/User";
import { UserRepository } from "../repositories/UserRepository";



export class Userservice{
    constructor(
        private userRepository: UserRepository
    ){}

    async create(data: { email: string, name: string,  password: string}): Promise<User>{
        const existing = await this.userRepository.findByEmail(data.email);
        if(existing){
            throw new Error('User with this email already exists');
        }
        const user = await this.userRepository.create(data);
        return user;
    }
}