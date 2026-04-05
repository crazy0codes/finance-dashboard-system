import { Role } from "@prisma/client";

function isValidEmail(email) {
    return typeof email === "string" && email.includes("@");
}

export function validateRegister(req, res, next) {
    let { email, password, role } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({
            error: "Valid email is required"
        });
    }

    if (!password || password.trim() === "" || password.length < 6) {
        return res.status(400).json({
            error: "Password must be at least 6 characters"
        });
    }

    const roles = Object.values(Role);

    if (!role) {
        req.body.role = Role.VIEWER;
    } else if (!roles.includes(role)) {
        return res.status(400).json({
            error: "Invalid role"
        });
    }

    next();
}

export function validateLogin(req, res, next) {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({
            error: "Valid email is required"
        });
    }

    if (!password || password.trim() === "") {
        return res.status(400).json({
            error: "Password is required"
        });
    }

    next();
}