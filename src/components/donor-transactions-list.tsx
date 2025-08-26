import { BeneficialTransactionIProps } from '@/types'
import React, { Suspense, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import moment from 'moment';
import DeleteButton from './DeleteButton';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';

function htmlConvert(data: string) {
    const jsonAndHtml = data.split("^");
    const html = jsonAndHtml[0];
    return (
        <div className="py-2">
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
};
const formateAmount = (item: BeneficialTransactionIProps, type: string) => {
    if (item.paymentType === type) {
        return Number(item.amount).toLocaleString('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        });
    } else {
        return ''
    }
}

const TableRowItem = React.memo(({ item, index }: { item: BeneficialTransactionIProps, index: number }) => {
    const formatDate = useMemo(() => moment(item.date).format('DD/MM/YYYY'), [item.date]);
    const amount = useMemo(() => formateAmount(item, 'donate'), [item]);
    const spendAmount = useMemo(() => formateAmount(item, 'spend'), [item]);
    return (
        <TableRow key={index}>
            <TableCell className="font-medium">{formatDate}</TableCell>
            <TableCell className="font-medium">{amount}</TableCell>
            <TableCell className="font-medium">{spendAmount}</TableCell>
            <TableCell className="font-medium uppercase">
                {
                    item.description && (<Dialog>
                        <DialogTrigger>
                            <Button className='bg-color-sub' size={"sm"}>
                                Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='p-8 bg-white'>
                            <DialogHeader>
                                <DialogDescription>
                                    {
                                        htmlConvert(item.description || '')
                                    }
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>)
                }
            </TableCell>
            <TableCell className="font-medium uppercase">
                <DeleteButton type='beneficial/transaction' username={item?.id as string} />
            </TableCell>
        </TableRow>
    )
})

TableRowItem.displayName = "TableRowItem";

function TransactionsList({ data }: { data: BeneficialTransactionIProps[] }) {
    return (
        <TableBody>
            {
                data.map((item, index: number) => (
                    <TableRowItem key={index} item={item} index={index} />
                ))
            }
        </TableBody>
    )
}



export default function BeneficialDonorTransactionList({ data }: { data: BeneficialTransactionIProps[] }) {
    return (
        <div className='flex flex-col'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>DATE</TableHead>
                        <TableHead className=' uppercase'>Donate</TableHead>
                        <TableHead className=' uppercase'>Spend</TableHead>
                        <TableHead className=' uppercase'>Details</TableHead>
                        <TableHead className=' uppercase'>Deleted</TableHead>
                    </TableRow>
                </TableHeader>
                <TransactionsList data={data} />
            </Table>

        </div>
    )
}
