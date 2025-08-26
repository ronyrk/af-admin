import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import { BeneficialDonorIProps, BeneficialTransactionIProps } from '@/types';
import BeneficialDonorProfileEdit from '@/components/beneficial-donor-profile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BeneficialDonorTransactionCreate } from '@/components/beneficial-donor-transaction';
import { BeneficialDonorSpendTransactionCreate } from '@/components/beneficial-donor-transaction-spend';
import { notFound } from 'next/navigation';
import BeneficialDonorTransactionList from '@/components/donor-transactions-list';

function TransactionsListSkeleton() {
    return (

        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>DATE</TableHead>
                    <TableHead className=' uppercase'>Amount</TableHead>
                    <TableHead className=' uppercase'>Description</TableHead>
                    <TableHead className=' uppercase'>Deleted</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">
                                <div className="animate-pulse bg-gray-200 h-4 w-24" />
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <div className="animate-pulse bg-gray-200 h-4 w-16" />
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <div className="animate-pulse bg-gray-200 h-4 w-32" />
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <div className="animate-pulse bg-gray-200 h-4 w-16" />
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>

    )
}

async function page({ params }: { params: Promise<{ username: string }> }) {
    cookies();
    const { username } = await params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/beneficial/donor/${username}`, { cache: 'no-store' });
    const beneficialDonor: BeneficialDonorIProps = await response.json();

    if (!beneficialDonor) {
        notFound();
    }
    console.log(beneficialDonor.beneficialTransaction, "transaction")

    return (
        <div>
            <BeneficialDonorProfileEdit data={beneficialDonor} />
            <div className='py-2 flex justify-between gap-2'>
                <BeneficialDonorTransactionCreate beneficialDonorId={beneficialDonor.id as string} />
                <BeneficialDonorSpendTransactionCreate beneficialDonorId={beneficialDonor.id as string} />
            </div>
            <Suspense fallback={<TransactionsListSkeleton />}>
                <BeneficialDonorTransactionList data={beneficialDonor.beneficialTransaction as BeneficialTransactionIProps[]} />
            </Suspense>
        </div>
    )
}

export default page