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
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { BranchIProps, DonorIProps } from "@/types"
import { useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
	code: z.string().min(4),
	username: z.string().min(2).max(50),
	email: z.string(),
	password: z.string(),
	about: z.string(),
	amount: z.string(),
	lives: z.string(),
	hometown: z.string(),
	status: z.string(),
	name: z.string(),
});

function DonorCreate() {
	const [image, setImage] = useState<string>("");
	const router = useRouter();
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ username, email, code, password, name, photoUrl, about, amount, lives, hometown, status }: DonorIProps) => {
			const response = await axios.post("/api/donor", {
				username, email, code, password, name, photoUrl, about, amount, lives, hometown, status
			});
			return response.data;
		},
	});

	const upload = image.length >= 1;

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const photoUrl = image;
		const code = values.code;
		const username = values.username;
		const email = values.email;
		const password = values.password;
		const name = values.name;
		const status = values.status;
		const hometown = values.hometown;
		const lives = values.lives;
		const amount = values.amount;
		const about = values.about;

		// Branch Created
		mutate({ username, email, code, password, name, photoUrl, about, amount, lives, hometown, status }, {
			onSuccess: ({ message, result }: { message: string, result: BranchIProps }) => {
				if (result.id) {
					toast.success(message);
				} else {
					throw new Error("Donor Created Failed")
				}
				router.push(`/dashboard/donor`);
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
					<div className=" grid grid-cols-3 items-center gap-3">
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
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input placeholder="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex flex-col justify-center items-center p-0">
							<Label className="pb-1">Photos</Label>
							<UploadButton
								className="ut-button:bg-color-sub mb-[-40px] ut-button:ut-readying:bg-color-sub/80"
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
							name="lives"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Lives</FormLabel>
									<FormControl>
										<Input placeholder="Lives" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="hometown"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Hometown</FormLabel>
									<FormControl>
										<Input placeholder="hometown" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Team Leader Name</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="LEADER">LEADER</SelectItem>
												<SelectItem value="DONOR">DONOR</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="about"
							render={({ field }) => (
								<FormItem>
									<FormLabel>About</FormLabel>
									<FormControl>
										<Textarea placeholder="Type your message here." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}
				</form>
			</Form>
		</div>
	)
}

export default DonorCreate;