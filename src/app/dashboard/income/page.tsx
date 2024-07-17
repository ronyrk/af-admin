"use client";
import React, { Suspense, useState } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';
import { PencilIcon } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { DateFormateConvert } from "@/lib/formateDateConvert"
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { IncomeIProps, SearchIProps } from '@/types';
import toast from 'react-hot-toast';




function TableIncome() {

	const month = new Date();
	const year = new Date().getFullYear();
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: addDays(new Date(), -46),
		to: new Date(),
	});
	const [transaction, setTransaction] = React.useState("");
	const [page, setPage] = React.useState<string>("1");
	const [income, setIncome] = React.useState([]);

	const dateFrom = DateFormateConvert(date?.from as any);
	const dateTo = DateFormateConvert(date?.to as any);



	const { mutate, isPending } = useMutation({
		mutationFn: async ({ dateTo, dateFrom, transaction, page }: SearchIProps) => {
			const response = await axios.get(`/api/income-search?from=${dateFrom}&to=${dateTo}&transaction=${transaction}&page=${page}`);
			return response.data;
		},
	});

	React.useEffect(() => {
		mutate({ dateFrom, dateTo, page, transaction }, {
			onSuccess: (data) => {
				toast.success(" Successfully Updated");
				setIncome(data);
			},
			onError: (error) => {
				toast.error("Updated Failed");
			}
		});
	}, [dateFrom, dateTo, mutate, transaction, page]);

	function GetIncome(data: IncomeIProps[]) {
		const Amount: number[] = [];
		const income = data?.forEach((item) => Amount.push(Number(item.amount)));
		const sum = Amount?.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
		return `${sum}`;
	}
	return (
		<div className='flex flex-col'>
			<h2 className="text-center text-xl">Income List</h2>
			<div className="p-2 flex justify-between ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`disbursement/create`}>Create</Link>
				</Button>
				<div className="grid gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								id="date"
								className={cn(
									"w-[300px] justify-start text-left font-normal",
									!date && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{date?.from ? (
									date.to ? (
										<>
											{format(date.from, "PPP")} -{" "}
											{format(date.to, "PPP")}
										</>
									) : (
										format(date.from, "PPP")
									)
								) : (
									<span>Pick a date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								initialFocus
								mode="range"
								defaultMonth={date?.from}
								selected={date}
								onSelect={setDate}
								numberOfMonths={2}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<Input className='w-64' type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransaction(e.target.value)} placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>DATE</TableHead>
						<TableHead className=' uppercase'>Amount</TableHead>
						<TableHead className=' uppercase'>Payment Method</TableHead>
						<TableHead className=' uppercase'>Transaction ID</TableHead>
						<TableHead className=' uppercase'>Updated</TableHead>
						<TableHead className=' uppercase'>Deleted</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<TableBody>
						{
							income?.map((item: any, index: number) => (
								<TableRow key={index}>
									<TableCell className="font-medium">{`${moment(item?.date).format('DD/MM/YYYY')}`}</TableCell>
									<TableCell className="font-medium uppercase">{item.amount}</TableCell>
									<TableCell className="font-medium uppercase">{item.type}</TableCell>
									<TableCell className="font-medium uppercase">{item.transaction}</TableCell>


									<TableCell className="font-medium uppercase">
										<Button className=' bg-gray-300 text-red-400 hover:text-red-700 hover:bg-gray-50' asChild >
											<Link href={`income/${item.id}`}><PencilIcon color='blue' size={18} /></Link></Button>
									</TableCell>
									<TableCell className="font-medium uppercase">
										<DeleteButton type='income' username={item?.id as string} />
									</TableCell>
								</TableRow>
							))
						}
						<TableRow className=''>
							<TableCell className=" font-bold uppercase">Total</TableCell>
							<TableCell className="font-bold uppercase">{GetIncome(income)}</TableCell>
						</TableRow>
					</TableBody>
				</Suspense>
			</Table>
			<div className="flex justify-center py-4">
				<div className=' flex flex-row gap-2'>
					{
						Array.from({ length: Math.ceil(income.length / 20) })?.map((i: any, index) => (
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

export default TableIncome