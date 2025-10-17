
export class AppError extends Error{
    constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperator: boolean = true
    ){
        super(message);
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export class QuotaError extends AppError{
    constructor(message: string = 'Quota Exceeded'){
        super(message, 403);
    }
}