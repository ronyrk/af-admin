"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { ChildIProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import TailwindEditor from "@/components/editor"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"





const formSchema = z.object({
	name: z.string(),
	description: z.any(),
	username: z.string(),
	dream: z.string(),
	phone: z.string(),
	address: z.string(),
	academy: z.string(),
});

function Child() {
	const [image, setImage] = useState<string>("");

	const upload = image.length >= 1;

	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ name, username, photoUrl, phone, dream, description, address, academy }: ChildIProps) => {
			const response = await axios.post("/api/child", {
				name, username, photoUrl, phone, dream, description, address, academy
			});
			return response.data;
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const name = values.name;
		const description = values.description;
		const photoUrl = image;
		const username = values.username;
		const dream = values.dream;
		const phone = values.phone;
		const address = values.address;
		const academy = values.academy;

		if (upload === true) {
			mutate({ name, username, photoUrl, phone, dream, description, address, academy }, {
				onSuccess: ({ message, result }: { message: string, result: ChildIProps }) => {
					if (result?.id) {
						toast.success(message);
						router.refresh();
						router.push(`/dashboard/child`);
						router.refresh();
					} else {
						toast.error(message);
					}
				},
				onError: ({ message }: { message: any }) => {
					toast.error(message);
				}
			});
		} else {

		}
	}
	return (
		<div>
			<div className="p-2">
				<h2 className="text-center text-2xl py-2 text-color-main">Create Child</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<div className="grid md:grid-cols-3 grid-cols-1  gap-3 rounded">
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>UserName</FormLabel>
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
											<Input placeholder="name" {...field} />
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
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input placeholder="Address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="dream"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Dream</FormLabel>
										<FormControl>
											<Input placeholder="Dream" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="academy"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Academy</FormLabel>
										<FormControl>
											<Input placeholder="academy" {...field} />
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
											<Input placeholder="Phone" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
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
						{isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}

					</form>
				</Form>

			</div>
		</div>
	)
}

export default Child