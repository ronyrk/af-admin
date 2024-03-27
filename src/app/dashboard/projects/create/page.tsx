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
import { FaqIProps, ProjectsIProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import TailwindEditor from "@/components/editor"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"





const formSchema = z.object({
	title: z.string(),
	description: z.any(),
	shortDec: z.string(),
	author: z.string(),
	username: z.string(),
});

function ProjectCreate() {
	const [image, setImage] = useState<string>("");

	const upload = image.length >= 1;

	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ title, description, author, shortDes, photoUrl, username }: ProjectsIProps) => {
			const response = await axios.post("/api/project", {
				title, description, author, shortDes, photoUrl, username
			});
			return response.data;
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const title = values.title;
		const description = values.description;
		const author = values.author;
		const photoUrl = image;
		const shortDes = values.shortDec;
		const username = values.username;

		mutate({ title, description, author, photoUrl, shortDes, username }, {
			onSuccess: (data: ProjectsIProps) => {
				if (data?.id) {
					toast.success("Create Successfully Project");
				} else {
					throw new Error("Branch Created Failed")
				}
				router.refresh();
			},
			onError: (error) => {
				toast.error("Created Failed");
			}
		});
		console.log(values, "result");
	}
	return (
		<div>
			<div className="p-2">
				<h2 className="text-center py-2 text-color-main">Create Project</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="title" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="author"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Author</FormLabel>
									<FormControl>
										<Input placeholder="Author" {...field} />
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
										<Textarea placeholder="Short Description" {...field} />
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
						{isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}
					</form>
				</Form>

			</div>
		</div>
	)
}

export default ProjectCreate