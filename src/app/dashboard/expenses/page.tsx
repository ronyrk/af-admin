"use client";
import React, { Suspense } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';
import DeleteButton from '@/components/DeleteButton';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { SearchIProps } from '@/types';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from '@/components/ui/dialog';

async function htmlConvert(data: string) {
    const jsonAndHtml = data.split("^");
    const html = jsonAndHtml[0];
    return (
        <div className="py-2">
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}



function TableExpenses() {
    const [date, setDate] = React.useState<Date>()
    const [transaction, setTransaction] = React.useState("");
    const [page, setPage] = React.useState<string>("1");
    const [expenses, setExpenses] = React.useState([]);




    const { mutate, isPending } = useMutation({
        mutationFn: async ({ date, page }: SearchIProps) => {
            const response = await axios.get(`/api/expenses?from=${date == undefined ? "udd" : date}&page=${page}`);
            return response.data;
        },
    });

    React.useEffect(() => {
        mutate({ date, page, transaction }, {
            onSuccess: (data) => {
                setExpenses(data);
            },
            onError: (error) => {
                toast.error("Updated Failed");
            }
        });
    }, [date, mutate, transaction, page]);

    return (
        <div className='flex flex-col'>
            <h2 className="text-center text-xl">Expenses List</h2>
            <div className="p-2 flex justify-between ">
                <Button asChild>
                    <Link className=' bg-color-main hover:bg-color-sub' href={`expenses/create`}>Create</Link>
                </Button>
                <div className="grid gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                onSelect={setDate}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className=' uppercase'>DATE</TableHead>
                        <TableHead className=' uppercase'>Amount</TableHead>
                        <TableHead className=' uppercase'>Details</TableHead>
                        <TableHead className=' uppercase'>Deleted</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
                    {
                        isPending ? <h2>Loading...</h2> :
                            <TableBody>
                                {
                                    expenses?.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{`${moment(item?.date).format('DD/MM/YYYY')}`}</TableCell>
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
                                                <DeleteButton type='expenses' username={item?.id as string} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                    }
                </Suspense>
            </Table>
            <div className="flex justify-center py-4">
                <div className=' flex flex-row gap-2'>
                    {
                        Array.from({ length: Math.ceil(expenses.length / 20) })?.map((i: any, index) => (
                            <Button variant="outline" aria-disabled={Number(page) === index + 1} className={`text-black ${Number(page) === index + 1 ? "bg-color-sub" : ""}`} key={index}
                                onClick={() => setPage(`${index + 1}`)}
                            >
                                {1 + index}
                            </Button>

                        ))
                    }
                </div >
            </div>
        </div>
    )
}

export default TableExpenses