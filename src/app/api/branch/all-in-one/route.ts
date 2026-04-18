import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type PaymentRow = {
    amount: string | null;
    loanAmount: string | null;
};

type BorrowerRow = {
    balance: string | null;
    recovered: string | null;
    status: string | null;
    payments: PaymentRow[];
};

type DonorPaymentRow = {
    amount: string | null;
    donate: string | null;
    loanPayment: string | null;
    type: string | null;
    status: string | null;
    upComing: boolean | null;
};

type DonorRow = {
    amount: string | null;
    status: string | null;
    donorPayments: DonorPaymentRow[];
};

type BorrowerStats = {
    totalDisbursed: number;
    totalRecovered: number;
    totalBalance: number;
    totalRunning: number;
    totalCompleted: number;
};

type BranchSummary = {
    total: number;
    totalDonorDisbursed: number;
    totalDonorRecovered: number;
    totalDonated: number;
    totalDonorOutstanding: number;
    totalBorrowerDisbursed: number;
    totalBorrowerRecovered: number;
    totalBorrowerBalance: number;
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────

/** Strip non-numeric chars, return clean float — never NaN. */
const parseAmount = (value: string | null | undefined): number => {
    if (value == null || value === "") return 0;
    const n = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(n) ? 0 : n;
};

// ─── BORROWER STATS ───────────────────────────────────────────────────────────

const BORROWER_STATS_INIT: BorrowerStats = {
    totalDisbursed: 0,
    totalRecovered: 0,
    totalBalance: 0,
    totalRunning: 0,
    totalCompleted: 0,
};

function calcBorrowerStats(borrowers: BorrowerRow[]): BorrowerStats {
    const acc = { ...BORROWER_STATS_INIT };

    for (const b of borrowers) {
        const balance = parseAmount(b.balance);
        let loanTotal = 0;
        let paymentTotal = 0;

        for (const p of b.payments) {
            loanTotal += parseAmount(p.loanAmount);
            paymentTotal += parseAmount(p.amount);
        }

        // Disbursed = total loan principal + remaining balance
        const disbursed = loanTotal + balance;

        acc.totalDisbursed += disbursed;
        acc.totalRecovered += paymentTotal;
        acc.totalBalance += balance; // ✅ Fixed: accumulate per-borrower balance

        // ✅ Fixed: balance > 0 means loan still running, 0 or less means completed
        if (balance > 0) acc.totalRunning++;
        else acc.totalCompleted++;
    }

    return acc;
}

// ─── DONOR STATS ──────────────────────────────────────────────────────────────

type DonorStats = {
    lending: number;
    refund: number;
    donorDonate: number;
    leanderDonate: number;
    totalDonate: number;
    outstanding: number;
    leaderCount: number;
    donorCount: number;
};

const DONOR_STATS_INIT: DonorStats = {
    lending: 0,
    refund: 0,
    donorDonate: 0,
    leanderDonate: 0,
    totalDonate: 0,
    outstanding: 0,
    leaderCount: 0,
    donorCount: 0,
};

function calcDonorStats(donors: DonorRow[]): DonorStats {
    const acc = { ...DONOR_STATS_INIT };

    for (const donor of donors) {
        const isLeader = donor.status === "LEADER";

        if (isLeader) {
            acc.lending += parseAmount(donor.amount);
            acc.leaderCount++;
        } else {
            acc.donorDonate += parseAmount(donor.amount);
            acc.donorCount++;
        }

        for (const p of donor.donorPayments) {
            if (p.type === "LENDING") {
                acc.lending += parseAmount(p.amount);
            }

            if (p.type === "REFOUND") {
                acc.refund += parseAmount(p.loanPayment);
            }

            if (p.type === "DONATE") {
                acc.totalDonate += parseAmount(p.donate);

                if (donor.status === "DONOR") {
                    acc.donorDonate += parseAmount(p.donate);
                } else if (isLeader) {
                    acc.leanderDonate += parseAmount(p.donate);
                }
            }
        }
    }

    // outstanding = total loaned out minus what has been refunded back
    acc.outstanding = acc.lending - (acc.refund + acc.leanderDonate);

    return acc;
}

// ─── BRANCH SUMMARY ───────────────────────────────────────────────────────────

function calcBranchSummary(b: BorrowerStats, d: DonorStats): BranchSummary {
    return {
        total: d.outstanding - b.totalBalance,
        totalDonorDisbursed: d.lending + d.donorDonate,
        totalDonorRecovered: d.refund,
        totalDonated: d.totalDonate,
        totalDonorOutstanding: d.outstanding,
        totalBorrowerDisbursed: b.totalDisbursed,
        totalBorrowerRecovered: b.totalRecovered,
        totalBorrowerBalance: b.totalBalance,
    };
}

// ─── PRISMA SELECT SHAPE ──────────────────────────────────────────────────────

const BRANCH_SELECT = {
    id: true,
    code: true,
    username: true,
    email: true,
    branchName: true,
    district: true,
    ps: true,
    address: true,
    photoUrl: true,
    status: true,
    // Team leader
    teamLeaderName: true,
    teamLeaderPhone: true,
    teamLeaderAddress: true,
    teamLeaderOccupation: true,
    teamLeaderPhotoUrl: true,
    // President
    presidentName: true,
    presidentPhone: true,
    presidentAddress: true,
    presidentOccupation: true,
    // Imam
    ImamName: true,
    ImamPhone: true,
    ImamAddress: true,
    ImamOccupation: true,
    // Secretary
    SecretaryName: true,
    SecretaryPhone: true,
    SecretaryAddress: true,
    SecretaryOccupation: true,
    // Relations — only fields needed for stats
    borrowers: {
        select: {
            balance: true,
            recovered: true,
            status: true,
            payments: true,
        },
    },
    donorLists: {
        select: {
            amount: true,
            status: true,
            donorPayments: true,
        },
    },
} as const;

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
    const authorization = request.headers.get("authorization");
    const token = authorization?.split(" ")[1];

    let username: string;

    try {
        const payload = await verifyToken(token as string);
        username = (payload as { username: string; role: string }).username;
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid or expired token" },
            { status: 401 }
        );
    }

    try {
        if (!username) {
            return NextResponse.json(
                { success: false, message: "Username is required" },
                { status: 400 }
            );
        }

        const branch = await prisma.branchList.findUnique({
            where: { username },
            select: BRANCH_SELECT,
        });

        if (!branch) {
            return NextResponse.json(
                { success: false, message: "Branch not found" },
                { status: 404 }
            );
        }

        // Compute stats — pure functions, no I/O
        const borrowerStats = calcBorrowerStats(branch.borrowers);
        const donorStats = calcDonorStats(branch.donorLists);
        const branchSummary = calcBranchSummary(borrowerStats, donorStats);

        return NextResponse.json(
            {
                success: true,
                data: {
                    branch: {
                        id: branch.id,
                        code: branch.code,
                        username: branch.username,
                        email: branch.email,
                        branchName: branch.branchName,
                        district: branch.district,
                        ps: branch.ps,
                        address: branch.address,
                        photoUrl: branch.photoUrl,
                        status: branch.status,
                        teamLeader: {
                            name: branch.teamLeaderName,
                            phone: branch.teamLeaderPhone,
                            address: branch.teamLeaderAddress,
                            occupation: branch.teamLeaderOccupation,
                            photoUrl: branch.teamLeaderPhotoUrl,
                        },
                        president: {
                            name: branch.presidentName,
                            phone: branch.presidentPhone,
                            address: branch.presidentAddress,
                            occupation: branch.presidentOccupation,
                        },
                        imam: {
                            name: branch.ImamName,
                            phone: branch.ImamPhone,
                            address: branch.ImamAddress,
                            occupation: branch.ImamOccupation,
                        },
                        secretary: {
                            name: branch.SecretaryName,
                            phone: branch.SecretaryPhone,
                            address: branch.SecretaryAddress,
                            occupation: branch.SecretaryOccupation,
                        },
                    },
                    summary: {
                        borrowers: {
                            count: branch.borrowers.length,
                            ...borrowerStats,
                        },
                        donors: {
                            count: branch.donorLists.length,
                            ...donorStats,
                        },
                        branch: branchSummary,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        // console.error("[BRANCH_GET]", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}