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
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { ChildIProps, DisbursementIProps } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import TailwindEditor from "@/components/editor"
import { DateTimePicker } from "@/components/ui/custom-calender"


const formSchema = z.object({
	username: z.string(),
	description: z.string(),
	amount: z.string(),
	date: z.date({
		required_error: "A date is required.",
	}),
});


function DonorPaymentCreate() {
	const router = useRouter();

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),

	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ username, date, amount, description }: DisbursementIProps) => {
			const response = await axios.post("/api/disbursement", {
				username, date, amount, description
			});
			return response.data;
		},
	});
	// Branch List
	const { data, isLoading } = useQuery<ChildIProps[]>({
		queryKey: ["child"],
		queryFn: async () => {
			const response = await axios.get('/api/child');
			return response.data;
		},
		refetchInterval: 10000,
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const previous = values.date;
		const date = new Date(previous);
		date.setDate(previous.getDate() + 1);
		const username = values.username;
		const description = values.description;
		const amount = values.amount;
		// Donor /Lender Payment Created
		mutate({ username, date, description, amount }, {
			onSuccess: (data: DisbursementIProps) => {
				if (data?.id) {
					toast.success("Disbursement Create Successfully");
				} else {
					throw new Error("Disbursement Created Failed")
				}
				router.push(`/dashboard/disbursement`);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Request Created Failed");
			}
		});
	};

	return (
		<div className="flex flex-col gap-3">
			<h2 className="text-center text-xl">Donor Payment Create</h2>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className=" grid grid-cols-1 items-center gap-3">

						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Child</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified Child" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{
													data?.map((item, index) => (

														<SelectItem key={index} value={item.username}>{item.name}</SelectItem>

													))
												}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
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
							name="description"
							render={({ field }) => (
								<FormItem className="">
									<FormLabel>Description</FormLabel>
									<FormControl className="">
										<TailwindEditor description={field.name} onChange={field.onChange} value={field.value} />
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

export default DonorPaymentCreate;