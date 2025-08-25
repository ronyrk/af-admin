import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import prisma from '@/lib/prisma';
import { BeneficialDonorIProps, BeneficialTransactionIProps } from '@/types';
import BeneficialDonorProfileEdit from '@/components/beneficial-donor-profile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BeneficialTransactionList from '@/components/transaction-list';
import { BeneficialDonorTransactionCreate } from '@/components/beneficial-donor-transaction';
import Beneficial from '../../[username]/page';
import { BeneficialDonorSpendTransactionCreate } from '@/components/beneficial-donor-transaction-spend';

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
    const beneficialDonor = await prisma.beneficialDonor.findUnique({
        where: { username },
        include: {
            beneficialTransaction: true
        }
    }) as BeneficialDonorIProps;
    return (
        <div>
            <BeneficialDonorProfileEdit data={beneficialDonor} />
            <div className='py-2 flex justify-between gap-2'>
                <BeneficialDonorTransactionCreate beneficialDonorId={beneficialDonor.id as string} />
                <BeneficialDonorSpendTransactionCreate beneficialDonorId={beneficialDonor.id as string} />
            </div>
            <Suspense fallback={<TransactionsListSkeleton />}>
                <BeneficialTransactionList data={beneficialDonor.beneficialTransaction as BeneficialTransactionIProps[]} />
            </Suspense>
        </div>
    )
}

export default page