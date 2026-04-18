"use server";

import { unstable_noStore } from "next/cache";
import prisma from "./prisma";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaginationMeta = {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export type PaginatedResult<T> = {
    data: T[];
    pagination: PaginationMeta;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPagination(
    page: number,
    take: number,
    totalCount: number
): PaginationMeta {
    const totalPages = Math.ceil(totalCount / take);
    return {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

function parsePage(page: string): number {
    const parsed = parseInt(page, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function buildSearchFilter(query: string) {
    if (query === "all" || !query.trim()) return undefined;

    return {
        OR: [
            { code: { contains: query, mode: "insensitive" as const } },
            { name: { contains: query, mode: "insensitive" as const } },
        ],
    };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Search donors with pagination and full-text search.
 */
export type UserPayload = {
    username: string;
    role: "branch" | "admin" | string;
};

export async function getSearchDonor(
    query: string,
    page: string,
    payload?: UserPayload | null
): Promise<PaginatedResult<Awaited<ReturnType<typeof prisma.donorList.findMany>>[number]>> {
    unstable_noStore();

    const currentPage = parsePage(page);
    const take = DEFAULT_PAGE_SIZE;
    const skip = take * (currentPage - 1);

    let where = buildSearchFilter(query) ?? {};

    // If payload is present and role-based filtering is needed, add here
    if (payload && payload.role === "branch") {
        // Example: only show donors for this branch (customize as needed)
        // where = { ...where, branch: payload.username };
        // If not needed, leave as is
    }

    const [data, totalCount] = await prisma.$transaction([
        prisma.donorList.findMany({
            where,
            orderBy: { code: "asc" },
            skip,
            take,
        }),
        prisma.donorList.count({ where }),
    ]);

    return {
        data,
        pagination: buildPagination(currentPage, take, totalCount),
    };
}