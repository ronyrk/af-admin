"use server";

import { unstable_noStore } from "next/cache";
import prisma from "./prisma";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 10;
const BRANCH_PAGE_SIZE = 5;

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserPayload = {
	username: string;
	role: "branch" | "admin" | string;
};

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
			{ address: { contains: query, mode: "insensitive" as const } },
		],
	};
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Search borrowers (loans) with role-based scoping and full-text search.
 * Branch users only see their own branch records.
 */
export async function getSearchBorrowers(
	query: string,
	page: string,
	payload: UserPayload | null
): Promise<PaginatedResult<Awaited<ReturnType<typeof prisma.loan.findMany>>[number]>> {
	unstable_noStore();

	if (!payload) {
		return {
			data: [],
			pagination: buildPagination(1, DEFAULT_PAGE_SIZE, 0),
		};
	}

	const { username, role } = payload;
	const currentPage = parsePage(page);
	const take = DEFAULT_PAGE_SIZE;
	const skip = take * (currentPage - 1);

	const isBranch = role === "branch";
	const branchFilter = isBranch ? { branch: username } : {};
	const searchFilter = buildSearchFilter(query);

	const where = {
		...branchFilter,
		...(searchFilter ?? {}),
	};

	const [data, totalCount] = await prisma.$transaction([
		prisma.loan.findMany({
			where,
			orderBy: { code: "asc" },
			skip,
			take,
		}),
		prisma.loan.count({ where }),
	]);

	return {
		data,
		pagination: buildPagination(currentPage, take, totalCount),
	};
}

/**
 * Fetch paginated loans filtered by a specific branch.
 */
export async function getSearchBorrowersByBranch(
	page: string,
	branch: string
): Promise<PaginatedResult<Awaited<ReturnType<typeof prisma.loan.findMany>>[number]>> {
	unstable_noStore();

	if (!branch?.trim()) {
		return {
			data: [],
			pagination: buildPagination(1, BRANCH_PAGE_SIZE, 0),
		};
	}

	const currentPage = parsePage(page);
	const take = BRANCH_PAGE_SIZE;
	const skip = take * (currentPage - 1);

	const where = { branch };

	const [data, totalCount] = await prisma.$transaction([
		prisma.loan.findMany({
			where,
			orderBy: { code: "asc" },
			skip,
			take,
		}),
		prisma.loan.count({ where }),
	]);

	return {
		data,
		pagination: buildPagination(currentPage, take, totalCount),
	};
}