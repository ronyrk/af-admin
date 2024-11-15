import prisma from "./prisma";



export const DonateInfo = async (donorUsername: string) => {
    try {
        const all = await prisma.donateAmount.findMany({
            where: {
                donorUsername
            }
        });
        return all;
    } catch (error) {
        throw new Error("Donate Info data fetch failed");
    };
};