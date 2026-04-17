// types/branch.ts

import { Status } from "@prisma/client";

// ─── PAYMENT ─────────────────────────────────────────────────────
export type TPayment = {
    id: string;
    amount: string;
    loanAmount: string;
    createAt: Date;
    loanusername: string;
};

// ─── DONOR PAYMENT ───────────────────────────────────────────────
export type TDonorPayment = {
    id: string;
    amount: string | null;
    loanPayment: string | null;
    donate: string | null;
    type: string;
    status: string;
    createAt: Date;
    returnDate: Date | null;
    upComing: boolean;
    donorUsername: string;
};

// ─── BORROWER ────────────────────────────────────────────────────
export type TBorrower = {
    id: string;
    username: string;
    name: string;
    code: string;
    address: string;
    about: string | null;
    disbursed: string | null;
    recovered: string | null;
    balance: string;
    form1: string;
    form2: string;
    nidfont: string;
    nidback: string;
    occupation: string;
    phone: string;
    photosUrl: string;
    status: Status;
    branch: string;
    payments: TPayment[];
};

// ─── DONOR ───────────────────────────────────────────────────────
export type TDonor = {
    id: string;
    username: string;
    email: string;
    code: string;
    password: string;
    name: string;
    photoUrl: string;
    about: string;
    amount: string | null;
    lives: string;
    hometown: string;
    status: string;
    socailMedia1: string;
    socailMedia2: string;
    mobile: string;
    branch: string;
    donorPayments: TDonorPayment[];
};

// ─── BRANCH PEOPLE ───────────────────────────────────────────────
export type TTeamLeader = {
    name: string;
    phone: string;
    address: string;
    occupation: string;
    photoUrl: string;
};

export type TPresident = {
    name: string;
    phone: string;
    address: string;
    occupation: string;
};

export type TImam = {
    name: string;
    phone: string;
    address: string;
    occupation: string;
};

export type TSecretary = {
    name: string;
    phone: string;
    address: string;
    occupation: string;
};

// ─── BRANCH ──────────────────────────────────────────────────────
export type TBranch = {
    id: string;
    code: string;
    username: string;
    email: string;
    branchName: string;
    district: string;
    ps: string;
    address: string;
    photoUrl: string[];
    status: string;
    teamLeader: TTeamLeader;
    president: TPresident;
    imam: TImam;
    secretary: TSecretary;
};

// ─── SUMMARY ─────────────────────────────────────────────────────
export type TBorrowerSummary = {
    count: number;
    totalDisbursed: number;
    totalRecovered: number;
    totalBalance: number;
    totalPaid: number;
    totalRunning: number;
    totalCompleted: number;
    totalDefaulted: number;
};

export type TDonorSummary = {
    count: number;
    totalDonorAmount: number;
    totalLoaned: number;
    totalDonated: number;
    totalLoanPayment: number;
    totalPaid: number;
    totalPending: number;
    totalUpcoming: number;
    totalSettled: number;
};

export type TBranchSummary = {
    totalFunds: number;
    totalLoanOut: number;
    totalLoanRecovered: number;
    totalLoanBalance: number;
    totalBorrowerDisbursed: number;
    totalBorrowerRecovered: number;
    totalBorrowerBalance: number;
};

export type TSummary = {
    borrowers: TBorrowerSummary;
    donors: TDonorSummary;
    branch: TBranchSummary;
};

// ─── API RESPONSE ─────────────────────────────────────────────────
export type TBranchApiResponse = {
    success: boolean;
    data: {
        branch: TBranch;
        borrowers: TBorrower[];
        donors: TDonor[];
        summary: TSummary;
    };
};

// ─── ERROR RESPONSE ──────────────────────────────────────────────
export type TErrorResponse = {
    success: false;
    message: string;
};