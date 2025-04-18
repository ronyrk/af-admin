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
import { ChildIProps, ChildIUpdatedProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"
import UpdatedEditor from "./UpdatedEditor"
import { Textarea } from "./ui/textarea"





const formSchema = z.object({
	name: z.string(),
	description: z.any(),
	dream: z.string(),
	phone: z.string(),
	address: z.string(),
	academy: z.string(),
	link: z.string(),
	outsidePaymentInfo: z.string(),
	paymentInfo: z.string(),
	shortDes: z.string(),
});

function ChildUpdated({ data }: { data: ChildIProps }) {
	const [image, setImage] = useState<string>(data.photoUrl);

	const upload = image.length >= 1;

	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: data.name,
			dream: data.dream,
			phone: data.phone,
			address: data.address,
			academy: data.academy,
			paymentInfo: data.paymentInfo,
			outsidePaymentInfo: data.outsidePaymentInfo,
			link: data.link,
			shortDes: data.shortDes,
		}
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ name, photoUrl, phone, dream, description, address, academy, paymentInfo, outsidePaymentInfo, link, shortDes }: ChildIUpdatedProps) => {
			const response = await axios.patch(`/api/child/${data.username}`, {
				name, photoUrl, phone, dream, description, address, academy, paymentInfo, outsidePaymentInfo, link, shortDes
			});
			return response.data;
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const name = values.name;
		const description = values.description;
		const photoUrl = image;
		const dream = values.dream;
		const phone = values.phone;
		const address = values.address;
		const academy = values.academy;
		const outsidePaymentInfo = values.outsidePaymentInfo;
		const paymentInfo = values.paymentInfo;
		const link = values.link;
		const shortDes = values.shortDes;

		if (upload === true) {
			mutate({ name, photoUrl, phone, dream, description, address, academy, paymentInfo, outsidePaymentInfo, link, shortDes }, {
				onSuccess: ({ message, result }: { message: string, result: ChildIProps }) => {
					toast.success(message);
					router.refresh();
				},
				onError: ({ message }: { message: any }) => {
					// console.log(message, "comment");
					toast.error(message);
				}
			});
		} else {
			toast.error("Upload pictures");
		}
		// console.log(values, "result");
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
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input defaultValue={data.name} placeholder="name" {...field} />
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
											<Input defaultValue={data.address} placeholder="Address" {...field} />
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
											<Input defaultValue={data.dream} placeholder="Dream" {...field} />
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
											<Input defaultValue={data.academy} placeholder="academy" {...field} />
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
											<Input defaultValue={data.phone} placeholder="Phone" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="link"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Outside Payment Link</FormLabel>
										<FormControl>
											<Input defaultValue={data.link} placeholder="link" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="shortDes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Short Description</FormLabel>
									<FormControl>
										<Textarea rows={6} defaultValue={data.shortDes} placeholder="Short Description" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="paymentInfo"
							render={({ field }) => (
								<FormItem className="">
									<FormLabel>Bangladeshi Payment Description</FormLabel>
									<FormControl className="">
										<UpdatedEditor content={data.paymentInfo} description={field.name} onChange={field.onChange} value={field.value} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="outsidePaymentInfo"
							render={({ field }) => (
								<FormItem className="">
									<FormLabel>Outside Payment Description</FormLabel>
									<FormControl className="">
										<UpdatedEditor content={data.outsidePaymentInfo} description={field.name} onChange={field.onChange} value={field.value} />
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
										<UpdatedEditor content={data.description} description={field.name} onChange={field.onChange} value={field.value} />
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

export default ChildUpdated