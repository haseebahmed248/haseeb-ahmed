import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";


export const ErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void =>{
    if( err instanceof AppError){
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        })
        return;
    }

    //unexpected errors
    console.error('Unexpected Error:',err);
    res.status(500).json({
        success: false,
        error: 'Internal Service Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}