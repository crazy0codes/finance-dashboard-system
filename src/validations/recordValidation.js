import { RecordType, Category } from "@prisma/client"

const type = Object.values(RecordType)
const category = Object.values(Category)

function isValidId(id) {
    return id && !isNaN(id)
}

function isValidDate(date) {
    return !isNaN(new Date(date).getTime())
}

export function validateCreateRecord(req, res, next) {
    const { amount, type: recordType, category: recordCategory, date } = req.body

    if (amount === undefined || isNaN(amount) || Number(amount) < 0) {
        return res.status(400).json({ error: "Invalid amount" })
    }

    if (!recordType || !type.includes(recordType)) {
        return res.status(400).json({ error: "Invalid type" });
    }

    if (!recordCategory || !category.includes(recordCategory)) {
        return res.status(400).json({ error: "Invalid category" })
    }

    if (!date || !isValidDate(date)) {
        return res.status(400).json({ error: "Invalid date" });
    }

    next();
}

export function validateUpdateRecord(req, res, next) {
    const id = parseInt(req.params.id)

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid ID" })
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "No data provided to update" })
    }

    const { amount, type: recordType, category: recordCategory, date } = req.body

    if (amount !== undefined) {
        if (isNaN(amount) || Number(amount) < 0) {
            return res.status(400).json({ error: "Invalid amount" })
        }
    }

    if (recordType !== undefined) {
        if (!type.includes(recordType)) {
            return res.status(400).json({ error: "Invalid type" });
        }
    }

    if (recordCategory !== undefined) {
        if (!category.includes(recordCategory)) {
            return res.status(400).json({ error: "Invalid category" });
        }
    }

    if (date !== undefined) {
        if (!isValidDate(date)) {
            return res.status(400).json({ error: "Invalid date" });
        }
    }

    next()
}

export function validateDeleteRecord(req, res, next) {
    const id = parseInt(req.params.id)

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid ID" })
    }

    next();
}

export function validateGetAllRecords(req, res, next) {
    const { type: recordType, category: recordCategory, startDate, endDate } = req.query

    if (recordType !== undefined && !type.includes(recordType)) {
        return res.status(400).json({ error: "Invalid type filter" })
    }

    if (recordCategory !== undefined && !category.includes(recordCategory)) {
        return res.status(400).json({ error: "Invalid category filter" })
    }

    if (startDate && !isValidDate(startDate)) {
        return res.status(400).json({ error: "Invalid startDate" })
    }

    if (endDate && !isValidDate(endDate)) {
        return res.status(400).json({ error: "Invalid endDate" })
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
            error: "startDate cannot be greater than endDate"
        })
    }

    next()
}