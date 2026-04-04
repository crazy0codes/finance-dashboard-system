import prisma from "../config/db"

export async function getAllUsers() {
    try {
        const users = await prisma.user.findMany();
        return users.map(({ password, ...user }) => user);

    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error");
    }
}

export async function updateUserRole(id, role) {

    try {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) throw new Error("User not found");
        const user = await prisma.user.update({
            where: {
                id
            },
            data: {
                role
            }
        })

        const { password: _, ...updatedUserRole } = user;
        return updatedUserRole;

    } catch (error) {
        if (error.message === "User not found") throw error;
        console.error(error);
        throw new Error("Internal Server Error");
    }
}

export async function updateUserStatus(id, status) {
    try {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) throw new Error("User not found");
        const user = await prisma.user.update({
            where: {
                id
            },
            data: {
                status
            }
        })

        const { password: _, ...updatedUserStatus } = user;
        return updatedUserStatus;

    } catch (error) {
        if (error.message === "User not found") throw error;
        console.error(error);
        throw new Error("Internal Server Error");
    }
}

export async function deleteUser(id) {
    try {
        const user = await prisma.user.delete({
            where: {
                id
            }
        });

        const deletedUser = user ? "User deleted" : "Error"

        return deletedUser;

    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error");
    }
}