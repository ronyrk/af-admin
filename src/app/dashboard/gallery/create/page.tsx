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
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { CategoryIProps, GalleryIProps, GalleryProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"





const formSchema = z.object({
	category: z.string(),
	link: z.string().optional(),
});

function ProjectCreate() {
	const [image, setImage] = useState<string>("");
	const [categoryType, setCategoryType] = useState<string>("");

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = e.target.value;
		setCategoryType(selectedValue)
	};

	const upload = image.length >= 1;

	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { data, isLoading } = useQuery<CategoryIProps[]>({
		queryKey: ["category"],
		queryFn: async () => {
			const response = await axios.get('/api/category');
			return response.data;
		},
		refetchInterval: 10000,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ category, content }: GalleryIProps) => {
			const response = await axios.post("/api/gallery", {
				category, content
			});
			return response.data;
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const category = values.category;
		const content = image;


		mutate({ category, content }, {
			onSuccess: (data: GalleryProps) => {
				if (data?.id) {
					toast.success("Create Successfully");
				} else {
					throw new Error(" Created Failed")
				}
				router.refresh();
				router.push(`/dashboard/gallery`);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Created Failed");
			}
		});
	}
	return (
		<div>
			<div className="p-2">
				<h2 className="text-center py-2 text-color-main">Create Project</h2>
				<div className="rounded">
					<label htmlFor="CategoryType" className="block mb-2">
						Category Type:
					</label>
					<select
						id="CategoryType"
						value={categoryType}
						onChange={handleTypeChange}
						className="w-full border rounded px-1 py-[1px] cursor-pointer"
					>
						<option value="">Select a file type</option>
						<option value="video">Video</option>
						<option value="Picture">Picture</option>

					</select>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem className="">
									<FormLabel>Category</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified Category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="video">Video</SelectItem>
												{
													data?.map((item, index) => (

														<SelectItem key={index} value={item.path}>{item.name}</SelectItem>

													))
												}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{
							categoryType === "picture" &&
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
						}
						{
							categoryType === "video" && <FormField
								control={form.control}
								name="link"
								render={({ field }) => (
									<FormItem>
										<FormLabel>YouTube Video Link</FormLabel>
										<FormControl>
											<Input value={image} placeholder="Youtube Video Link" onChange={(e) => setImage(e.target.value)} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						}

						{isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}
					</form>
				</Form>

			</div>
		</div>
	)
}

export default ProjectCreate