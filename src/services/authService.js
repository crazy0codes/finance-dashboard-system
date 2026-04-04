import prisma from "../config/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { AppError } from "../utils/appError.js";

export async function register(email, password, role) {
    if (!email || !password) {
        throw new AppError("Email and password are required", 400)
    }

    try {
        const isUser = await prisma.user.findFirst({
            where: {
                email
            }
        });

        if (isUser) throw new AppError("Email already exists", 409);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        })

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;

    } catch (error) {
        if(error.isOperational) throw error;
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
}

export async function login(email, password) {
    if (!email || !password) {
        throw new AppError("Invalid Credentials", 401);
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!user) {
            throw new AppError("No user found", 404);
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new AppError("Invalid Credentails", 401)
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return token;

    } catch (error) {
        if(error.isOperational) throw error;
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
}