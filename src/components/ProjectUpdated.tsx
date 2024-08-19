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
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { FaqIProps, ProjectsIProps, ProjectsIUpdatedProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"
import UpdatedEditor from "./UpdatedEditor"





const formSchema = z.object({
	title: z.string(),
	description: z.any(),
	shortDec: z.string(),
	paymentInfo: z.string(),
	link: z.string(),
	outsidePaymentInfo: z.string(),

});

function ProjectUpdated({ data }: { data: ProjectsIProps }) {
	const [image, setImage] = useState<string>(data.photoUrl);

	const upload = image.length >= 1;

	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: data.title,
			shortDec: data.shortDes,
			link: data.link,
			outsidePaymentInfo: data.outsidePaymentInfo,
			paymentInfo: data.paymentInfo,
			description: data.description,
		}
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ title, description, shortDes, photoUrl, paymentInfo, outsidePaymentInfo, link }: ProjectsIUpdatedProps) => {
			const response = await axios.patch(`/api/project/${data.username}`, {
				title, description, shortDes, photoUrl, paymentInfo, outsidePaymentInfo, link
			});
			return response.data;
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const title = values.title;
		const description = values.description;
		const photoUrl = image;
		const shortDes = values.shortDec;
		const paymentInfo = values.paymentInfo;
		const outsidePaymentInfo = values.outsidePaymentInfo;
		const link = values.link;

		mutate({ title, description, photoUrl, shortDes, paymentInfo, outsidePaymentInfo, link }, {
			onSuccess: (data: ProjectsIProps) => {
				toast.success("Successfully Updated");
				router.push(`/dashboard/projects`);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Updated Failed");
			}
		});
		// console.log(values, "result");
	}
	return (
		<div>
			<div className="p-2">
				<h2 className="text-center py-2 text-color-main">Create Project</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">

						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input defaultValue={data.title} placeholder="title" {...field} />
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
									<FormLabel>Outside payment Link</FormLabel>
									<FormControl>
										<Input defaultValue={data.link} placeholder="link" {...field} />
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
							name="shortDec"
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
									<FormLabel>Bangladesh Payment Description</FormLabel>
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

export default ProjectUpdated