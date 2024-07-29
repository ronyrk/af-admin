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

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, PencilIcon } from "lucide-react"
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
import { FormLabel } from '@/components/ui/form';
import { usePathname } from 'next/navigation';
import DeleteButton from '@/components/DeleteButton';




function IncomeDetails() {
	const pathname = usePathname();
	const [start, setStartDate] = React.useState<Date>()
	const [end, setEndDate] = React.useState<Date>()
	const [transaction, setTransaction] = React.useState("");
	const [page, setPage] = React.useState<string>("1");
	const [income, setIncome] = React.useState([]);




	const { mutate, isPending } = useMutation({
		mutationFn: async ({ start, end, transaction, page }: SearchIProps) => {
			const response = await axios.get(`/api/income-search?from=${start == undefined ? "u" : start}&to=${end == undefined ? "u" : end}&transaction=${transaction}&page=${page}`);
			return response.data;
		},
	});

	React.useEffect(() => {
		mutate({ start, end, page, transaction }, {
			onSuccess: (data) => {
				toast.success(" Successfully Updated");
				setIncome(data);
			},
			onError: (error) => {
				toast.error("Updated Failed");
			}
		});
	}, [start, end, mutate, transaction, page]);

	function GetIncome(data: IncomeIProps[]) {
		const Amount: number[] = [];
		const income = data?.forEach((item) => Amount.push(Number(item.amount)));
		const sum = Amount?.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
		return `${sum}`;
	}
	return (
		<div className="">
			<div className='flex flex-col my-3 border-2 py-2 px-1 rounded-sm'>
				<h2 className="text-center text-2xl font-semibold text-color-main">Income List</h2>
				<div className=" flex flex-row md:gap-3 gap-1  flex-wrap justify-between items-center p-2">

					<Button className='mt-6' asChild>
						<Link className=' bg-color-main hover:bg-color-sub' href={`income/create`}>Create</Link>
					</Button>

					<div className=' flex flex-col gap-1'>
						<h2 className=" text-base font-bold">From</h2>
						<Popover>
							<PopoverTrigger asChild>
								<Button

									className={cn(
										"w-[150px] text-white justify-start text-left font-normal",
										!start && "text-muted-foreground  text-white"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{start ? format(start, "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									onSelect={setStartDate}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className=' flex flex-col gap-1'>
						<h2 className="text-base font-bold">To</h2>
						<Popover>
							<PopoverTrigger asChild>
								<Button

									className={cn(
										"w-[150px] text-white justify-start text-left font-normal",
										!end && "text-muted-foreground  text-white"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{end ? format(end, "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									onSelect={setEndDate}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className="py-2 flex flex-col justify-center">
						<h2 className=' flex flex-col justify-center gap-1 font-bold text-base'>Transaction</h2>
						<Input className='w-64' type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransaction(e.target.value)} placeholder="Search" />
					</div>
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
		</div>
	)
}

export default IncomeDetails