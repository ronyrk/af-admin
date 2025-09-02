import React, { Suspense } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableFooter, TableBody, TableCell } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { unstable_noStore } from 'next/cache';
import { FilterSkeleton, LoadingFallback } from '@/components/FilterSkeleton';
import Pagination from '@/components/beneficial-pagination';
import { getBeneficialDonorData } from '@/lib/getBeneficialDonorData';
import BeneficialDonorList from '@/components/BeneficialDonorList';
import FilterControlsDonor from '@/components/FilterControlsDonor';
import { BeneficialTransactionIProps, TotalsIProps } from '@/types';

interface PageProps {
    searchParams?: {
        search?: string;
        page?: string;
    };
}

// Wrapper component to handle async location options
async function FilterControlsWrapper() {

    return <FilterControlsDonor />;
}

// Optimized calculation functions with better error handling and performance
const calculateTotal = (transactions: BeneficialTransactionIProps[], field: string): number => {
    if (!transactions?.length) return 0;

    return transactions.reduce((total, item) => {
        if (item?.paymentType === field) {
            const amount = Number(item.amount) || 0;
            return total + amount;
        }
        return total;
    }, 0);
};

const calculateTotals = (transactions: BeneficialTransactionIProps[]): TotalsIProps => {
    if (!transactions?.length) {
        return { totalDonate: 0, totalSpend: 0, totalBalance: 0 };
    }

    // Single pass calculation for better performance
    const totals = transactions.reduce(
        (acc, item) => {
            const amount = Number(item.amount) || 0;
            if (item?.paymentType === 'donate') {
                acc.totalDonate += amount;
            } else if (item?.paymentType === 'spend') {
                acc.totalSpend += amount;
            }
            return acc;
        },
        { totalDonate: 0, totalSpend: 0, totalBalance: 0 }
    );

    totals.totalBalance = totals.totalDonate - totals.totalSpend;
    return totals;
};

// Format currency helper
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
    }).format(amount);
};




export default async function Page({ searchParams }: PageProps) {
    unstable_noStore();

    // Fetch transactions with error handling
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/beneficial/transaction`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        console.log(`Failed to fetch transactions: ${response.status}`);
    }

    const transactions: BeneficialTransactionIProps[] = await response.json();

    // Calculate totals
    const totals = calculateTotals(transactions);


    const { data, pagination } = await getBeneficialDonorData(searchParams || {});
    const currentPage = Number(searchParams?.page || '1');
    const pageSize = 10;

    return (
        <div className="flex flex-col space-y-1 py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Beneficial Donor Management</h1>
                    <p className="text-gray-600 mt-1">Manage and track beneficial donors</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard/beneficiaries/donor/create">
                        Create New Beneficial Donor
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<FilterSkeleton />}>
                <FilterControlsWrapper />
            </Suspense>

            <div className="bg-white rounded-lg shadow">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 ">
                            <TableHead className="font-semibold ">Index</TableHead>
                            <TableHead className="font-semibold ">Profile & Details</TableHead>
                            <TableHead className="font-semibold ">Donate</TableHead>
                            <TableHead className="font-semibold ">Spending</TableHead>
                            <TableHead className="font-semibold ">Balance</TableHead>
                            <TableHead className="font-semibold ">Others</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <Suspense fallback={<LoadingFallback />}>
                            <BeneficialDonorList
                                data={data}
                                currentPage={currentPage}
                                pageSize={pageSize}
                            />
                        </Suspense>
                        <TableRow>
                            <TableCell colSpan={2} className="text-center">
                                <div className={`text-lg font-bold  truncate`}>
                                    Total:-
                                </div>
                            </TableCell>
                            {/* Balance Column */}
                            <TableCell className="p-1">
                                <div className={`text-lg font-bold  truncate`}>
                                    {formatCurrency(totals.totalDonate)}
                                </div>
                            </TableCell>
                            <TableCell className="p-1">
                                <div className={`text-lg font-bold  truncate`}>
                                    {formatCurrency(totals.totalSpend)}
                                </div>
                            </TableCell>
                            <TableCell className="p-1">
                                <div className={`text-lg font-bold  truncate`}>
                                    {formatCurrency(totals.totalBalance)}
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableHead colSpan={6}>
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    hasNext={pagination.hasNext}
                                    hasPrev={pagination.hasPrev}
                                />
                            </TableHead>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
}