import {
    updateUserRole,
    deleteUser,
    getAllUsers,
    updateUserStatus
} from "../services/userService"

export async function getAllUserController(req, res) {
    try {
        const users = await getAllUsers();
        return res.status(200).json({
            users
        })
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function updateUserRoleController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const { role } = req.body;
        const updatedRole = await updateUserRole(id, role);
        return res.status(200).json({ ...updatedRole })
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function updateUserStatusController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        const updatedStatus = await updateUserStatus(id, status);
        res.status(200).json({
            ...updatedStatus
        })
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function deleteUserController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const user = await deleteUser(id);
        return res.status(200).json({
            user
        })
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}