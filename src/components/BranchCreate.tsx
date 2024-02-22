"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useFormState, useFormStatus } from 'react-dom'
import { uploadImage } from '@/lib/ImageUpload';
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { PaymentIProps } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useUser } from './ContextProvider'


const FormSchema = z.object({
	method: z.string(),
	amount: z.string(),
});

const initialState = {
	photoUrl: "",
	message: "",
	error: false
};



function PaymentRequest() {

	const router = useRouter();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),

	});
	// Payment Request
	// const { mutate, isPending } = useMutation({
	// 	mutationFn: async ({ loanusername, amount, photoUrl, method }: PaymentIProps) => {
	// 		const response = await axios.post("/api/requestPayment", {
	// 			loanusername, method, amount, photoUrl
	// 		});
	// 		return response.data;
	// 	},
	// });

	// const [state, formAction] = useFormState(uploadImage, initialState);
	// const { pending } = useFormStatus();

	function onSubmit(data: z.infer<typeof FormSchema>) {

		// Send Payload payment Request
		// mutate({ loanusername, photoUrl, amount, method }, {
		// 	onSuccess: ({ message, payment }: { message: string, payment: PaymentIProps }) => {
		// 		if (payment.id) {
		// 			toast.success(message);
		// 			router.push(`/karze-hasana/borrowers/${username}`)

		// 		} else {
		// 			toast.error("payment Request Created Failed");
		// 		}
		// 	},
		// 	onError: (error) => {
		// 		toast.error("payment Request Created Failed");
		// 	}
		// });
	};
	return (
		<div className="py-2">
			<Dialog>
				<DialogTrigger><Button variant="outline" className="bg-color-main">Payment Request</Button></DialogTrigger>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle className='text-center text-color-main'>Payment Request</DialogTitle>
					</DialogHeader>
					<div className="">

						<Form {...form}>
							<form className='flex flex-row w-2/3 justify-between items-center gap-1'>
								<input type="file" name="image" id="image" accept='image/*' />
								<Button type="submit">Upload</Button>
							</form>
							<form className='flex flex-row w-2/3 justify-between items-center gap-1'>
								<input type="file" name="image" id="image" accept='image/*' />
								<Button type="submit">Upload</Button>
							</form>
							<form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-3">
								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Amount</FormLabel>
											<FormControl>
												<Input type='number' placeholder="amount" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="method"
									render={({ field }) => (
										<FormItem>
											<FormLabel>method</FormLabel>
											<FormControl>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a verified method" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="bkash">Bkash</SelectItem>
														<SelectItem value="nagad">Nagad</SelectItem>
														<SelectItem value="bank">Bank</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit">Submit</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default PaymentRequest