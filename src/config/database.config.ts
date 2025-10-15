import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export async function initDB(){
    try {
        await prisma.$connect();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1); // Exit the process with failure
    }
}

export { prisma as db };