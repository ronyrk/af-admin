import { BeneficialTransactionIProps } from '@/types'
import React, { Suspense } from 'react'
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
}

function TransactionsList({ data }: { data: BeneficialTransactionIProps[] }) {
    return (
        <TableBody>
            {
                data.map((item, index: number) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{`${moment(item.date).format('DD/MM/YYYY')}`}</TableCell>
                        <TableCell className="font-medium uppercase">{item.amount}</TableCell>
                        <TableCell className="font-medium uppercase">
                            <Dialog>
                                <DialogTrigger>
                                    <Button className='bg-color-sub' size={"sm"}>
                                        Details
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className='p-8 bg-white'>
                                    <DialogHeader>
                                        <DialogDescription>
                                            {
                                                htmlConvert(item.description)
                                            }
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </TableCell>
                        <TableCell className="font-medium uppercase">
                            <DeleteButton type='beneficial/transacttion' username={item?.id as string} />
                        </TableCell>
                    </TableRow>
                ))
            }
        </TableBody>
    )
}



export default function BeneficialTransactionList({ data }: { data: BeneficialTransactionIProps[] }) {
    return (
        <div className='flex flex-col'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>DATE</TableHead>
                        <TableHead className=' uppercase'>Amount</TableHead>
                        <TableHead className=' uppercase'>Description</TableHead>
                        <TableHead className=' uppercase'>Deleted</TableHead>
                    </TableRow>
                </TableHeader>
                <TransactionsList data={data} />
            </Table>

        </div>
    )
}
