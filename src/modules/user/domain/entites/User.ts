

export class User{
    id: string;
    email: string;
    name: string;
    password: string

    constructor(data: {
        id?: string,
        email: string,
        name: string,
        password: string
    }){
        this.id = data.id || '';
        this.name = data.name;
        this.email = data.email
        this.password = data.password
    }
}