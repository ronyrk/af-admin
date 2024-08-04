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

interface ParamsIProps {
    data: DonorIProps
}

async function TableRowList(params: ParamsIProps) {
    const { status, username } = params.data;
    unstable_noStore();
    const res = await fetch(`https://arafatfoundation.vercel.app/api/donor_payment/donor/${username}`);
    if (!res.ok) {
        throw new Error("Failed fetch Data");
    };
    const data: DonorPaymentIProps[] = await res.json();

    const loanAmount = async (amount: string, type: string) => {
        if (type === "increase") {
            return `BDT =${amount}/=`
        } else {
            return 'N/A'
        }
    }

    const loanPayment = async (amount: string, type: string) => {
        if (type === "return") {
            return `BDT =${amount}/=`
        } else {
            return 'N/A'
        }
    };
    return (
        <TableBody>
            {
                data.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{`${moment(item.createAt).format('DD/MM/YYYY')}`}</TableCell>
                        <TableCell>{loanAmount(item.amount, item.type)}</TableCell>
                        <TableCell className='px-4'>{loanPayment(item.loanPayment, item.type)} </TableCell>
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>DATE</TableHead>
                        <TableHead>LOAN AMOUNT</TableHead>
                        <TableHead>LOAN PAYMENT</TableHead>
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