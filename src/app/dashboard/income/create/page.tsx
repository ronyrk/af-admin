"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { IncomeIProps } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateTimePicker } from "@/components/ui/custom-calender"


const formSchema = z.object({
	type: z.string(),
	transaction: z.string(),
	amount: z.string(),
	date: z.date({
		required_error: "A date is required.",
	}),
});


function IncomeCreate() {
	const router = useRouter();

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),

	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ date, amount, type, transaction }: IncomeIProps) => {
			const response = await axios.post("/api/income", {
				date, amount, type, transaction
			});
			return response.data;
		},
	});


	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const previous = values.date;
		const date = new Date(previous);
		date.setDate(previous.getDate() + 1);
		const transaction = values.transaction;
		const type = values.type;
		const amount = values.amount;
		// console.log({ date })
		// Donor /Lender Payment Created
		mutate({ date, amount, type, transaction }, {
			onSuccess: ({ message, data }: { message: string, data: IncomeIProps }) => {
				if (data?.id) {
					toast.success(message);
				}
				router.push(`/dashboard/income`);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Request Created Failed");
			}
		});
	};
	// console.log(state, stateBranch);

	return (
		<div className="flex flex-col  gap-3">
			<h2 className="text-center text-xl">Income Create</h2>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className=" grid grid-cols-2 justify-items-stretch gap-3">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="flex flex-col mt-[10px]">
									<FormLabel>Date</FormLabel>
									<FormControl>
										<DateTimePicker value={field.value} onChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input type="number" placeholder="amount" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Payment method</FormLabel>
									<FormControl>
										<Input placeholder="method" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="transaction"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Transaction ID</FormLabel>
									<FormControl>
										<Input placeholder="Transaction ID" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{isPending ? <Button disabled >Loading...</Button> : <Button type="submit">Submit</Button>}
				</form>
			</Form>
		</div>
	)
}

export default IncomeCreate;