import React, { Suspense } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DonorIProps, DonorPaymentIProps } from '@/types'
import moment from 'moment';
import { unstable_noStore } from 'next/cache';
import DonorTableContext from './DonorTableContext';
import prisma from '@/lib/prisma';
import DeleteButton from './DeleteButton';
import LenderTableContext from './LenderTableContext';
import LenderDonationCreate from './LenderDonationCreate';
import { string } from 'zod';

interface ParamsIProps {
    data: DonorIProps
}

async function TableRowList(params: ParamsIProps) {
    const { status, username } = params.data;
    unstable_noStore();
    const data = await prisma.donorPayment.findMany({
        where: {
            donorUsername: username
        }
    }) as DonorPaymentIProps[];

    const loanAmount = async (amount: string, type: string) => {
        if (type === "LENDING") {
            return `BDT =${amount}/=`
        } else {
            return 'N/A'
        }
    }

    const loanPayment = async (payment: string, donate: string, type: string) => {
        if (payment === "0" && donate === "0") {
            return ` N/A`
        } else if (payment === "0") {
            return `BDT =${donate}/=`
        } else {
            return `BDT =${payment}/=`
        }
    };
    return (
        <TableBody>
            {
                data.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{`${moment(item.createAt).format('DD/MM/YYYY')}`}</TableCell>
                        <TableCell>{loanAmount(item.amount as string, item.type)}</TableCell>
                        <TableCell className='px-4'>{loanPayment(item.loanPayment as string, item.donate as string, item.type)} </TableCell>
                        <TableCell className='px-4'>{item.type} </TableCell>
                        <TableCell className='px-4'>
                            <DeleteButton type='donor/payment' username={item.id as string} />
                        </TableCell>
                    </TableRow>
                ))
            }
        </TableBody>
    )

}


function DonorTable(params: ParamsIProps) {
    return (
        <div className=' border-[2px] rounded-sm px-2'>
            <h2 className=" text-center font-semibold text-xl py-2 text-color-main uppercase">Transaction</h2>
            <div className="flex flex-row items-center py-2 justify-between">
                <DonorTableContext status={params.data.status} username={params.data.username} />
                {
                    params.data.status === "LEADER" && (
                        <LenderTableContext status={params.data.status} username={params.data.username} />
                    )
                }
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>DATE</TableHead>
                        <TableHead>LOAN AMOUNT</TableHead>
                        <TableHead>LOAN PAYMENT</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>DELETE</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2>Loading...</h2>}>
                    <TableRowList data={params.data} />
                </Suspense>
            </Table>

        </div>
    )
}

export default DonorTable