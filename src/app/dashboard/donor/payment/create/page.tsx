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
import { DonorIProps, DonorPaymentIProps, LoanIProps } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"


const formSchema = z.object({
	donorUsername: z.string(),
	amount: z.string(),
	loanPayment: z.string(),
	type: z.string(),
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
		mutationFn: async ({ donorUsername, amount, loanPayment, type, createAt }: DonorPaymentIProps) => {
			const response = await axios.post("/api/donor_payment", {
				donorUsername, amount, loanPayment, type, createAt
			});
			return response.data;
		},
	});
	// Branch List
	const { data, isLoading } = useQuery<DonorIProps[]>({
		queryKey: ["branch"],
		queryFn: async () => {
			const response = await axios.get('/api/donor');
			return response.data;
		},
		refetchInterval: 10000,
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const donorUsername = values.donorUsername;
		const amount = values.amount;
		const loanPayment = values.loanPayment;
		const type = values.type;
		const previous = values.date;
		const createAt = new Date(previous);
		createAt.setDate(previous.getDate() + 1);
		// Branch Created
		mutate({ donorUsername, amount, loanPayment, type, createAt }, {
			onSuccess: (data: DonorPaymentIProps) => {
				if (data?.id) {
					toast.success("Donor Payment Create Successfully");
				} else {
					throw new Error("Donor Payment Created Failed")
				}
				router.push(`/dashboard/donor/payment`);
			},
			onError: (error) => {
				toast.error("Donor payment Request Created Failed");
			}
		});
	};
	// console.log(state, stateBranch);

	return (
		<div className="flex flex-col gap-3">
			<h2 className="text-center text-xl">Donor Payment Create</h2>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className=" grid grid-cols-3 items-center gap-3">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"text-color-main pl-3 text-left font-normal",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value ? (
														format(field.value, "PPP")
													) : (
														<span>Pick a date</span>
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) =>
													date > new Date() || date < new Date("1900-01-01")
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="donorUsername"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Donor/Lender</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified Donor/Lender" />
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
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Amount" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="loanPayment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Loan Payment</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Loan Amount Payment" {...field} />
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
									<FormLabel>Payment Type</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified Payment Type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="increase">Donor to Company</SelectItem>
												<SelectItem value="return">Company to Donor</SelectItem>
											</SelectContent>
										</Select>
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