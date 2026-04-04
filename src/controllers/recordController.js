import {
    createRecord,
    getAllRecords,
    updateRecord,
    deleteRecord
} from "../services/recordService.js"


export async function createRecordController(req, res) {
    try {
        const userId = parseInt(req.user.id);
        const record = await createRecord(userId, req.body)
        return res.status(201).json({
            record
        })
    } catch (error) {
        return res.status(error.status).json({
            error: error.message
        })
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
        const id     = parseInt(req.params.id)
        const record = await updateRecord(id , req.body);
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