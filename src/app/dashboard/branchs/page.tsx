import React from 'react'
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { filterAndSortDonors } from '@/lib/fillterAndSortDonors';
import {
    BeneficialTransactionIProps,
    ChildDonateRequestProps,
    DonorPaymentIProps,
    DonorRequestIProps,
    PaymentApproveIProps,
    TotalsIProps
} from '@/types';
import { GetBranchDetails } from '@/lib/getBranchList';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://af-admin.vercel.app';

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
    }).format(amount);
};
export interface ApiResponse {
    success: boolean;
    data: {
        branch: {
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

            teamLeader: {
                name: string;
                phone: string;
                address: string;
                occupation: string;
                photoUrl: string;
            };

            president: {
                name: string;
                phone: string;
                address: string;
                occupation: string;
            };

            imam: {
                name: string;
                phone: string;
                address: string;
                occupation: string;
            };

            secretary: {
                name: string;
                phone: string;
                address: string;
                occupation: string;
            };
        };

        summary: {
            borrowers: {
                totalDisbursed: number;
                totalRecovered: number;
                totalBalance: number;
                totalRunning: number;
                totalCompleted: number;
            };

            donors: {
                lending: number;       // total donor amount
                refund: number;       // total loan payments returned to donors
                donorDonate: number;
                leanderDonate: number;
                totalDonate: number;  // total donated amount
                outstanding: number;  // amount still loaned out (not yet refunded)
                leaderCount: number;
                donorCount: number;
            };

            branch: {
                total: number;
                totalDonorDisbursed: number;
                totalDonorRecovered: number;
                totalDonated: number;
                totalDonorOutstanding: number;
                totalBorrowerDisbursed: number;
                totalBorrowerRecovered: number;
                totalBorrowerBalance: number;
            };
        };
    };
}


export default async function DashboardPage() {
    const token = await getAuthToken();
    try {
        // Ensure cookies are processed
        cookies();
        const response = await fetch('http://localhost:3000/api/branch/all-in-one', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data: ApiResponse = await response.json();

        return (
            <div className=''>
                <div className="p-2 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fund Summary Panel */}
                        <Link href="/dashboard" className="cursor-pointer">
                            <div className="border border-gray-300 rounded shadow-sm">
                                <div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
                                    Our Fund Summary
                                </div>
                                <div className="p-0">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-4">Categories</th>
                                                <th className="text-right py-2 px-4">Available balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-gray-200">
                                                <td className="py-2 px-4">DONOR & LENDER</td>
                                                <td className="text-right py-2 px-4">{formatCurrency(data.data.summary.donors.outstanding)}</td>
                                            </tr>
                                            <tr className="bg-gray-100">
                                                <td className="py-2 px-4">BORROWERS</td>
                                                <td className="text-right py-2 px-4">{formatCurrency(data.data.summary.borrowers.totalBalance)}</td>
                                            </tr>
                                            <tr className="bg-gray-200 font-semibold">
                                                <td className="py-2 px-4">Total</td>
                                                <td className="text-right py-2 px-4">{formatCurrency(data.data.summary.branch.total)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Dashboard error:', error);
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
                <p className="text-red-600">Please try refreshing the page.</p>
            </div>
        );
    }
}