
import { register, login } from "../services/authService"


export async function registerController(req, res) {
    try {
        const { email, password, role } = req.body;
        const user = await register(email, password, role);
        return res.status(201).json({ user });
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        const token = await login(email, password);
        return res.status(200).json({ token });
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}