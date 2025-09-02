import React, { Suspense } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableFooter, TableBody, TableCell } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getBeneficialData, getLocationOptions } from '@/lib/getBeneficialData';
import FilterControls from '@/components/FilterControls';
import BeneficialList from '@/components/BeneficialList';
import { unstable_noStore } from 'next/cache';
import { FilterSkeleton, LoadingFallback } from '@/components/FilterSkeleton';
import Pagination from '@/components/beneficial-pagination';
import { BeneficialTransactionIProps, TotalsIProps } from '@/types';

interface PageProps {
    searchParams?: {
        search?: string;
        district?: string;
        policeStation?: string;
        page?: string;
    };
}

// Wrapper component to handle async location options
async function FilterControlsWrapper({
    locationOptionsPromise
}: {
    locationOptionsPromise: Promise<{ districts: string[], policeStations: { policeStation: string, district: string }[] }>
}) {
    const locationOptions = await locationOptionsPromise;
    return <FilterControls locationOptions={locationOptions} />;
}

// Calculate totals helper
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
        throw new Error(`Failed to fetch transactions: ${response.status}`);
    }

    const transactions: BeneficialTransactionIProps[] = await response.json();

    // Calculate totals
    const totals = calculateTotals(transactions);

    const { data, pagination } = await getBeneficialData(searchParams || {});
    // Show skeleton while location options are loading
    const locationOptionsPromise = getLocationOptions();

    const currentPage = Number(searchParams?.page || '1');
    const itemsPerPage = 10;

    return (
        <div className="flex flex-col space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Beneficial Management</h1>
                    <p className="text-gray-600 mt-1">Manage and track beneficial recipients</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard/beneficiaries/create">
                        Create New Beneficiary
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<FilterSkeleton />}>
                <FilterControlsWrapper locationOptionsPromise={locationOptionsPromise} />
            </Suspense>

            <div className="bg-white rounded-lg shadow">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 ">
                            <TableHead className="font-semibold ">Index</TableHead>
                            <TableHead className="font-semibold ">Profile & Details</TableHead>
                            <TableHead className="font-semibold ">Total Spend</TableHead>
                            <TableHead className="font-semibold ">Status</TableHead>
                            <TableHead className="font-semibold ">Donor Info</TableHead>
                            <TableHead className="font-semibold ">Edit</TableHead>
                            <TableHead className="font-semibold ">Delete</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <Suspense fallback={<LoadingFallback />}>
                            <BeneficialList
                                data={data}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                            />
                        </Suspense>
                        <TableRow>
                            <TableCell className="text-center">

                            </TableCell>
                            <TableCell className="text-center">

                            </TableCell>
                            {/* Balance Column */}
                            <TableCell className="p-1">
                                <div className={`text-lg font-bold  truncate`}>
                                    {formatCurrency(totals.totalSpend)}
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