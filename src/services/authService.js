import prisma from "../config/db";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function register(email, password, role) {
    if (!email || !password) {
        throw new Error("Email and password are required")
    }

    try {
        const isUser = await prisma.user.findFirst({
            where: {
                email
            }
        });

        if (isUser) throw new Error("Email already exists");

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
        if (error.message === "Email already exists" ||
            error.message === "Email and password are required") {
            throw error;
        }


        console.error(error);
        throw new Error("Internal Server Error");
    }
}

export async function login(email, password) {
    if (!email || !password) {
        throw new Error("Invalid Credentials");
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!user) {
            throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Invalid Credentails")
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return token;

    } catch (error) {
        if (error.message === "Invalid Credentials" || error.message === "No user found") {
            throw error;
        }

        console.error(error);
        throw new Error("Internal Server Error");
    }
}