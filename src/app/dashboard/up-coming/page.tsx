import React, { Suspense } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DonorIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment, { now } from 'moment';
import { ClipboardPenLine } from 'lucide-react';
import { filterAndSortDonors } from '@/lib/fillterAndSortDonors';
import { getDonorName } from '@/lib/getDonorName';
import prisma from '@/lib/prisma';

interface DonorPaymentIProps {
    id?: string,
    donorUsername: string,
    loanPayment?: string,
    amount?: string,
    createAt: Date,
    type: string,
    returnDate?: Date,
    upComing: boolean,
};



async function DonorList() {
    cookies();
    const skips = 45;
    const list = await prisma.donorPayment.findMany() as DonorPaymentIProps[];

    const upComing = filterAndSortDonors(list, skips, true);

    async function getStatus(status: string) {
        if (status === "LEADER") {
            return "LENDER"
        } else {
            return status
        }
    };


    return (
        <>
            <TableBody>
                {
                    upComing.map((item, index: number) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium uppercase">{getDonorName(item.donorUsername)}</TableCell>
                            <TableCell className="font-medium uppercase">{item.amount}</TableCell>
                            <TableCell className="font-medium uppercase">{`${moment(item.returnDate).format('DD/MM/YYYY')}`}</TableCell>
                            <TableCell className="font-medium uppercase">
                                <Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
                                    <Link href={`donor/${item.donorUsername}`}><ClipboardPenLine /></Link>
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <DeleteButton type='donor/update' username={item.id as string} />
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </>
    )
};



async function page() {
    return (
        <div className='flex flex-col'>
            <h2 className="text-xl text-center">UpComing Lender Payment List</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>INDEX</TableHead>
                        <TableHead className='w-[200px]'>NAME</TableHead>
                        <TableHead>AMOUNT</TableHead>
                        <TableHead>RETURNED DATE</TableHead>
                        <TableHead>UPDATED</TableHead>
                        <TableHead>DELETED</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
                    <DonorList />
                </Suspense>
            </Table>
        </div>
    )
}

export default page