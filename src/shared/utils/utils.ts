import bcrypt from 'bcrypt'

export const HashPassword = async (password: string)=>{
    return await bcrypt.hash(password,10);
}