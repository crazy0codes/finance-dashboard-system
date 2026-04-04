
import prisma from "../config/db"
import { AppError } from "../utils/appError"

export async function createRecord(userId, data) {
    try {
        const record = await prisma.record.create({
            data: {
                userId,
                ...data,
            }
        })

        return record;

    } catch (error) {
        if (error.isOperational) throw error;
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
}

export async function getAllRecords(filters) {
    try {
        const records = await prisma.record.findMany({
            where: {
                deletedAt: null,
                ...filters
            }
        })

        return records;
    } catch (error) {
        if (error.isOperational) throw error;
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
}

export async function updateRecord(id, data) {
    try {
        const existing = await prisma.record.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) throw new AppError("Record not found", 404);
        const record = await prisma.record.update({ where: { id }, data });
        return record;
    } catch (error) {
        if (error.isOperational) throw error;
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
}

export async function deleteRecord(id) {
    try {
        const existing = await prisma.record.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) throw new AppError("Record not found", 404);

        const record = await prisma.record.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        return record;

    } catch (error) {
        if (error.isOperational) throw error; 
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
}