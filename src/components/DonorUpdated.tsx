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
import { BranchIProps, DonorIProps, DonorIUpdatedProps } from "@/types"
import { useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
	password: z.string(),
	about: z.string(),
	lives: z.string(),
	hometown: z.string(),
	status: z.string(),
	name: z.string(),
});

function DonorUpdated({ data }: { data: DonorIProps }) {
	const [image, setImage] = useState<string>(data.photoUrl);
	const router = useRouter();
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: data.password,
			about: data.about,
			lives: data.lives,
			hometown: data.hometown,
			status: data.status,
			name: data.name,
		}
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ password, name, photoUrl, about, lives, hometown, status }: DonorIUpdatedProps) => {
			const response = await axios.post(`/api/donor/${data.username}`, {
				password, name, photoUrl, about, lives, hometown, status
			});
			return response.data;
		},
	});

	const upload = image.length >= 1;

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const photoUrl = image;
		const password = values.password;
		const name = values.name;
		const status = values.status;
		const hometown = values.hometown;
		const lives = values.lives;
		const about = values.about;

		// Branch Created
		mutate({ password, name, photoUrl, about, lives, hometown, status }, {
			onSuccess: ({ message, result }: { message: string, result: DonorIProps }) => {
				if (result.id) {
					toast.success(message);
				} else {
					throw new Error("Donor Updated Failed")
				}
				router.push(`/dashboard/donor`);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Donor Updated Failed");
			}
		});
	};
	// console.log(state, stateBranch);

	return (
		<div className="">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className="grid items-center grid-cols-3 gap-3 ">
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
						<div className="flex flex-col items-center justify-center p-0">
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
									<FormLabel>Donor Or Lender</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="LEADER">LENDER</SelectItem>
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

export default DonorUpdated;