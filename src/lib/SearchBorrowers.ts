// lib/SearchBorrowers.ts
"use server";

import { unstable_noStore } from "next/cache";
import prisma from "./prisma";

const DEFAULT_PAGE_SIZE = 10;
const BRANCH_PAGE_SIZE = 5;

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

export type BorrowerStats = {
	totalDisbursed: number;
	totalRecovered: number;
	due: number;
};
export type LoanWithStats = (
	Awaited<ReturnType<typeof prisma.borrowers.findMany>>[number]
) & BorrowerStats;

export type PaginatedResult<T> = {
	data: T[];
	pagination: PaginationMeta;
};

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

function buildWhereClause(
	role: string,
	username: string,
	query: string
) {
	// BUG FIX: spreading { branch } and { OR: [...] } into one object causes
	// the OR key to silently overwrite any same-level key. Use explicit AND
	// so both conditions are always enforced together.
	const conditions: object[] = [];

	if (role === "branch") {
		conditions.push({ branch: username });
	}

	if (query && query !== "all" && query.trim()) {
		conditions.push({
			OR: [
				{ code: { contains: query, mode: "insensitive" as const } },
				{ name: { contains: query, mode: "insensitive" as const } },
				{ address: { contains: query, mode: "insensitive" as const } },
			],
		});
	}

	if (conditions.length === 0) return {};
	if (conditions.length === 1) return conditions[0];
	return { AND: conditions };
}

async function aggregatePaymentStats(
	usernames: string[]
): Promise<Map<string, BorrowerStats>> {
	if (usernames.length === 0) return new Map();

	const payments = await prisma.payment.findMany({
		where: { loanusername: { in: usernames } },
		select: { loanusername: true, loanAmount: true, amount: true },
	});

	const map = new Map<string, BorrowerStats>();

	for (const p of payments) {
		const prev = map.get(p.loanusername) ?? {
			totalDisbursed: 0,
			totalRecovered: 0,
			due: 0,
		};
		const totalDisbursed = prev.totalDisbursed + Number(p.loanAmount);
		const totalRecovered = prev.totalRecovered + Number(p.amount);
		map.set(p.loanusername, {
			totalDisbursed,
			totalRecovered,
			due: Math.max(0, totalDisbursed - totalRecovered),
		});
	}

	return map;
}

/**
 * Fetches paginated borrowers sorted by due balance (highest → lowest).
 *
 * MongoDB cannot ORDER BY a cross-collection computed field, so:
 *  1. Fetch ALL matching loan usernames (lightweight projection).
 *  2. Aggregate payment stats for those usernames in one query.
 *  3. Sort by due DESC in JS on the lightweight list.
 *  4. Slice the sorted list for the requested page.
 *  5. Fetch full loan records only for that page slice.
 *  6. Re-apply sort order (findMany with `in` returns arbitrary order).
 *
 * Fixed: 3 DB round-trips regardless of dataset size.
 */
export async function getSearchBorrowers(
	query: string,
	page: string,
	payload: UserPayload | null
): Promise<PaginatedResult<LoanWithStats>> {
	unstable_noStore();

	if (!payload) {
		return { data: [], pagination: buildPagination(1, DEFAULT_PAGE_SIZE, 0) };
	}

	const { username, role } = payload;
	const currentPage = parsePage(page);
	const take = DEFAULT_PAGE_SIZE;

	// BUG FIX: use buildWhereClause to correctly AND branch + search filters
	const where = buildWhereClause(role, username, query);

	// Step 1 — lightweight projection of all matching usernames
	const allLoans = await prisma.borrowers.findMany({
		where,
		select: { username: true },
	});

	const totalCount = allLoans.length;
	const allUsernames = allLoans.map((l) => l.username);

	// Step 2 — aggregate stats across all matched borrowers in one query
	const statsMap = await aggregatePaymentStats(allUsernames);

	// Step 3 — sort by due DESC in JS
	const sortedUsernames = allUsernames.sort((a, b) => {
		const dueA = statsMap.get(a)?.due ?? 0;
		const dueB = statsMap.get(b)?.due ?? 0;
		return dueB - dueA;
	});

	// Step 4 — slice for the current page
	const pageUsernames = sortedUsernames.slice(
		take * (currentPage - 1),
		take * currentPage
	);

	if (pageUsernames.length === 0) {
		return { data: [], pagination: buildPagination(currentPage, take, totalCount) };
	}

	// Step 5 — fetch full loan records for this page only
	const loans = await prisma.borrowers.findMany({
		where: { username: { in: pageUsernames } },
	});

	// Step 6 — re-apply sort order (findMany `in` does not guarantee order)
	const usernameOrder = new Map(pageUsernames.map((u, i) => [u, i]));

	const data: LoanWithStats[] = loans
		.map((loan) => ({
			...loan,
			...(statsMap.get(loan.username) ?? {
				totalDisbursed: 0,
				totalRecovered: 0,
				due: 0,
			}),
		}))
		.sort(
			(a, b) =>
				(usernameOrder.get(a.username) ?? 0) -
				(usernameOrder.get(b.username) ?? 0)
		);

	return {
		data,
		pagination: buildPagination(currentPage, take, totalCount),
	};
}

export async function getSearchBorrowersByBranch(
	page: string,
	branch: string
): Promise<PaginatedResult<Awaited<ReturnType<typeof prisma.borrowers.findMany>>[number]>> {
	unstable_noStore();

	if (!branch?.trim()) {
		return { data: [], pagination: buildPagination(1, BRANCH_PAGE_SIZE, 0) };
	}

	const currentPage = parsePage(page);
	const take = BRANCH_PAGE_SIZE;
	const skip = take * (currentPage - 1);
	const where = { branch };

	const [data, totalCount] = await prisma.$transaction([
		prisma.borrowers.findMany({ where, orderBy: { code: "asc" }, skip, take }),
		prisma.borrowers.count({ where }),
	]);

	return { data, pagination: buildPagination(currentPage, take, totalCount) };
}