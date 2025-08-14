import prisma from '@/lib/prisma';
import { BeneficialIProps } from '@/types';

interface FilterParams {
    search?: string;
    district?: string;
    policeStation?: string;
    page?: string;
}

export async function getBeneficialData(params: FilterParams) {
    const { search = "", district = "", policeStation = "", page = "1" } = params;
    const pageSize = 10;
    const skip = (Number(page) - 1) * pageSize;

    // Build where clause dynamically
    const whereClause: any = {};

    // District filter
    if (district && district !== 'all') {
        whereClause.district = {
            contains: district,
            mode: 'insensitive'
        };
    }

    // Police station filter (only if district is also selected or if no district filter)
    if (policeStation && policeStation !== 'all') {
        whereClause.policeStation = {
            contains: policeStation,
            mode: 'insensitive'
        };
    }

    // Search filter - searches across multiple fields
    if (search && search !== 'all' && search.trim() !== '') {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { village: { contains: search, mode: 'insensitive' } },
            { postoffice: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { occupation: { contains: search, mode: 'insensitive' } }
        ];
    }

    try {
        const [beneficials, totalCount] = await Promise.all([
            prisma.beneficial.findMany({
                where: whereClause,
                include: {
                    beneficialDonor: true,
                    beneficialTransaction: true,
                },
                skip,
                take: pageSize,
                orderBy: [
                    {
                        beneficialDonorId: 'asc' // NULL values (inactive) come first, then non-NULL (active)
                    },
                    {
                        createAt: 'desc' // Within each group, order by creation date (newest first)
                    }
                ]
            }),
            prisma.beneficial.count({
                where: whereClause
            })
        ]);

        return {
            data: beneficials as BeneficialIProps[],
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
}

// Get unique districts and police stations for dropdown options
export async function getLocationOptions() {
    try {
        const [districts, policeStations] = await Promise.all([
            prisma.beneficial.findMany({
                select: { district: true },
                distinct: ['district'],
                orderBy: { district: 'asc' }
            }),
            prisma.beneficial.findMany({
                select: { policeStation: true, district: true },
                distinct: ['policeStation', 'district'],
                orderBy: [{ district: 'asc' }, { policeStation: 'asc' }]
            })
        ]);

        return {
            districts: districts.map(d => d.district).filter(Boolean),
            policeStations: policeStations.map(ps => ({
                policeStation: ps.policeStation,
                district: ps.district
            })).filter(ps => ps.policeStation && ps.district)
        };
    } catch (error) {
        console.error('Error fetching location options:', error);
        return { districts: [], policeStations: [] };
    }
}
