import prisma from '@/lib/prisma';
import { BeneficialDonorIProps } from '@/types';

interface FilterParams {
    search?: string;
    page?: string;
}

export async function getBeneficialDonorData(params: FilterParams) {
    const { search = "", page = "1" } = params;
    const pageSize = 10;
    const skip = (Number(page) - 1) * pageSize;

    // Build where clause dynamically
    const whereClause: any = {};


    // Search filter - searches across multiple fields
    if (search && search !== 'all' && search.trim() !== '') {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } }
        ];
    }

    try {
        const [beneficialDonor, totalCount] = await Promise.all([
            prisma.beneficialDonor.findMany({
                where: whereClause,
                include: {
                    beneficialTransaction: true,
                },
                skip,
                take: pageSize,
                orderBy: [
                    {
                        createAt: 'desc' // Within each group, order by creation date (newest first)
                    }
                ]
            }),
            prisma.beneficialDonor.count({
                where: whereClause
            })
        ]);

        return {
            data: beneficialDonor as BeneficialDonorIProps[],
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / pageSize),
                totalCount,
                hasNext: Number(page) * pageSize < totalCount,
                hasPrev: Number(page) > 1
            }
        };
    } catch (error) {
        console.error('Error fetching beneficial data:', error);
        return {
            data: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalCount: 0,
                hasNext: false,
                hasPrev: false
            }
        };
    }
};