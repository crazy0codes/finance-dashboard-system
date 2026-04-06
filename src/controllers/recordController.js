import {
    createRecord,
    getAllRecords,
    updateRecord,
    deleteRecord
} from "../services/recordService.js"


export async function createRecordController(req, res) {
    try {
        const userId = parseInt(req.user.id);
        const { amount, type, category, date, notes } = req.body
        const record = await createRecord(userId, { amount, type, category, date, notes });
        return res.status(201).json({ record });
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function getAllRecordsController(req, res) {
    try {
        const records = await getAllRecords()
        return res.status(200).json({
            records
        })
    } catch (error) {
        return res.status(error.status).json({
            error: error.message
        })
    }
}

export async function updateRecordController(req, res) {
    try {
        const id = parseInt(req.params.id)
        const { amount, type, category, date, notes } = req.body;
        const record = await updateRecord(id, { amount, type, category, date, notes });
        return res.status(200).json({
            ...record
        })
    } catch (error) {
        return res.status(error.status).json({
            error: error.message
        })
    }
}

export async function deleteRecordController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const record = await deleteRecord(id);
        return res.status(200).json({
            record
        })
    } catch (error) {
        return res.status(error.status).json({
            error: error.message
        })
    }
}