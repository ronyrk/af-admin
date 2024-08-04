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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import DonorDonationCreate from './DonorDonationCreate';
import DonorDonationPayment from './DonorDonationPayment';
import DeleteButton from './DeleteButton';

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
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button >Add loan</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <DonorDonationCreate username={params.data.username} />
                    </AlertDialogContent>
                </AlertDialog>
                {params.data.status === "LEADER" && <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button >Pay loan</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <DonorDonationPayment username={params.data.username} />
                    </AlertDialogContent>
                </AlertDialog>}
            </div>
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