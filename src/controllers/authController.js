
import { register, login } from "../services/authService"


export async function registerController(req, res) {
    try {
        const { email, password, role } = req.body;
        const user = await register(email, password, role);
        return res.status(201).json({ user });
    } catch (error) {
        const statusMap = {
            "Email already exists": 409,
            "Email and password are required": 400,
        };
        const status = statusMap[error.message] || 500;
        return res.status(status).json({ error: error.message });
    }
}

export async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        const user = await login(email, password);
        return res.status(200).json({ user });
    } catch (error) {
        const statusMap = {
            "No user found": 401,
            "Invalid Credentials": 401,
        };
        const status = statusMap[error.message] || 500;
        return res.status(status).json({ error: error.message });
    }
}