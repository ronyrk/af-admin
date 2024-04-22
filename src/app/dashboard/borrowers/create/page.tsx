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
import { Label } from "@/components/ui/label"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { BranchIProps, DonorIProps, LoanIProps } from "@/types"
import { useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
	code: z.string().min(4),
	username: z.string(),
	branch: z.string(),
	balance: z.string(),
	about: z.optional(z.string()),
	phone: z.string(),
	occupation: z.string(),
	address: z.string(),
	name: z.string(),
});

function BorrowerCreate() {
	const [image, setImage] = useState<string>("");
	const [nidFont, setNidFont] = useState<string>("");
	const [nidBack, setNidBack] = useState<string>("");
	const [Form1, setForm1] = useState<string>("");
	const [Form2, setForm2] = useState<string>("");
	const router = useRouter();
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ username, name, code, branch, address, about, balance, form1, form2, nidback, nidfont, occupation, phone, photosUrl }: LoanIProps) => {
			const response = await axios.post("/api/loan", {
				username, name, code, branch, address, about, balance, form1, form2, nidback, nidfont, occupation, phone, photosUrl
			});
			return response.data;
		},
	});
	// Branch List
	const { data, isLoading } = useQuery<BranchIProps[]>({
		queryKey: ["branch"],
		queryFn: async () => {
			const response = await axios.get('/api/branch');
			return response.data;
		},
		refetchInterval: 10000,
	});

	const upload = image.length >= 1 && nidBack.length >= 1 && nidFont.length >= 1 && Form1.length >= 1 && Form2.length >= 1;

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const photosUrl = image;
		const form1 = Form1;
		const form2 = Form2;
		const nidfont = nidFont;
		const nidback = nidBack;
		const code = values.code;
		const username = values.username;
		const address = values.address;
		const balance = values.balance;
		const name = values.name;
		const occupation = values.occupation;
		const phone = values.phone;
		const about = values.about;
		const branch = values.branch;
		// Branch Created
		mutate({ username, name, code, branch, address, about, balance, form1, form2, nidback, nidfont, occupation, phone, photosUrl }, {
			onSuccess: ({ message, loan }: { message: string, loan: LoanIProps }) => {
				if (loan?.id) {
					toast.success(message);
				} else {
					throw new Error("Donor Created Failed")
				}
				router.push(`/dashboard/borrowers`);
			},
			onError: (error) => {
				toast.error("payment Request Created Failed");
			}
		});
	};
	// console.log(state, stateBranch);

	return (
		<div className="">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className="grid items-center grid-flow-row-dense grid-cols-3 gap-3 ">
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Code</FormLabel>
									<FormControl>
										<Input placeholder="code" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input placeholder="username" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="branch"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Branch</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified branch" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{
													data?.map((item, index) => (

														<SelectItem key={index} value={item.username}>{item.branchName}</SelectItem>

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
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input placeholder="address" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="balance"
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
						<div className="flex flex-col items-center justify-center p-0">
							<Label className="pb-1">Profile Picture</Label>
							<UploadButton
								className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									setImage(res[0].url)
									toast.success("Image Upload successfully")
								}}
								onUploadError={(error: Error) => {
									// Do something with the error.
									toast.error(error.message);
								}}
							/>
						</div>
						<div className="flex flex-col items-center justify-center p-0">
							<Label className="pb-1">Form One Picture</Label>
							<UploadButton
								className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									setForm1(res[0].url)
									toast.success("Image Upload successfully")
								}}
								onUploadError={(error: Error) => {
									// Do something with the error.
									toast.error(error.message);
								}}
							/>
						</div>
						<div className="flex flex-col items-center justify-center p-0">
							<Label className="pb-1">Form two Picture</Label>
							<UploadButton
								className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									setForm2(res[0].url)
									toast.success("Image Upload successfully")
								}}
								onUploadError={(error: Error) => {
									// Do something with the error.
									toast.error(error.message);
								}}
							/>
						</div>
						<div className="flex flex-col items-center justify-center p-0">
							<Label className="pb-1">NID Font Picture</Label>
							<UploadButton
								className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									setNidFont(res[0].url)
									toast.success("Image Upload successfully")
								}}
								onUploadError={(error: Error) => {
									// Do something with the error.
									toast.error(error.message);
								}}
							/>
						</div>
						<div className="flex flex-col items-center justify-center p-0">
							<Label className="pb-1">NID Back Picture</Label>
							<UploadButton
								className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									setNidBack(res[0].url)
									toast.success("Image Upload successfully")
								}}
								onUploadError={(error: Error) => {
									// Do something with the error.
									toast.error(error.message);
								}}
							/>
						</div>
						<FormField
							control={form.control}
							name="occupation"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Occupation</FormLabel>
									<FormControl>
										<Input placeholder="occupation" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone</FormLabel>
									<FormControl>
										<Input placeholder="phone" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="col-span-2">
							<FormField
								control={form.control}
								name="about"
								render={({ field }) => (
									<FormItem>
										<FormLabel>About</FormLabel>
										<FormControl>
											<Textarea cols={20} rows={4} placeholder="Type your message here." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					{isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}
				</form>
			</Form>
		</div>
	)
}

export default BorrowerCreate;