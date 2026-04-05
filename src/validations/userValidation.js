import { Role, Status } from "@prisma/client";

const roles = Object.values(Role);
const statuses = Object.values(Status);

function isValidId(id) {
    return id && !isNaN(id);
}

export function validateGetAllUsers(req, res, next) {
    next();
}

export function validateUpdateUserRole(req, res, next) {
    const id = parseInt(req.params.id);
    const { role } = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    if (!role || !roles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    next();
}

export function validateUpdateUserStatus(req, res, next) {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    if (!status || !statuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    next();
}

export function validateDeleteUser(req, res, next) {
    const id = parseInt(req.params.id);

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    next();
}