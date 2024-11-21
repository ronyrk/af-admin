import prisma from "./prisma"

export const getDonorName = async (username: string) => {
    try {
        const user = await prisma.donor.findUnique({
            where: {
                username
            }
        });
        return user?.name;
    } catch (error) {
        return `Not Available`
    }
};