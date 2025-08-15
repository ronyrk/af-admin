import React, { Suspense } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableFooter } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import BeneficialList from '@/components/BeneficialList';
import { unstable_noStore } from 'next/cache';
import { FilterSkeleton, LoadingFallback } from '@/components/FilterSkeleton';
import Pagination from '@/components/beneficial-pagination';
import { getBeneficialDonorData } from '@/lib/getBeneficialDonorData';
import BeneficialDonorList from '@/components/BeneficialDonorList';
import FilterControls from '@/components/FilterControls';
import FilterControlsDonor from '@/components/FilterControlsDonor';

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



export default async function Page({ searchParams }: PageProps) {
    unstable_noStore();

    const { data, pagination } = await getBeneficialDonorData(searchParams || {});

    return (
        <div className="flex flex-col space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Beneficial Management</h1>
                    <p className="text-gray-600 mt-1">Manage and track beneficial recipients</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard/beneficial/donor/create">
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
                            <TableHead className="font-semibold w-1/3">Profile & Details</TableHead>
                            <TableHead className="font-semibold w-1/4">Total Amount</TableHead>
                            <TableHead className="font-semibold w-24">Edit</TableHead>
                            <TableHead className="font-semibold w-24">Delete</TableHead>
                        </TableRow>
                    </TableHeader>
                    <Suspense fallback={<LoadingFallback />}>
                        <BeneficialDonorList data={data} />
                    </Suspense>
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