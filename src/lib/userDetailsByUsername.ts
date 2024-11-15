import prisma from "./prisma"

export const UserDetailsByUsername = async (username: string) => {
    try {
        const user = await prisma.donor.findUnique({
            where: {
                username
            }
        })
        return user?.name;
    } catch (error) {
        return `Not Available`
    }
}