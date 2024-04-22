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
import { LoanIProps, LoanIUpdatedProps } from "@/types"
import { useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
	about: z.optional(z.string()),
	phone: z.string(),
	occupation: z.string(),
	address: z.string(),
	name: z.string(),
});

function BorrowerUpdated({ data }: { data: LoanIProps }) {
	const [image, setImage] = useState<string>(data.photosUrl);
	const [nidFont, setNidFont] = useState<string>(data.nidfont);
	const [nidBack, setNidBack] = useState<string>(data.nidback);
	const [Form1, setForm1] = useState<string>(data.form1);
	const [Form2, setForm2] = useState<string>(data.form2);
	const router = useRouter();
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: data.name,
			occupation: data.occupation,
			phone: data.phone,
			about: data.about,
			address: data.address,
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ name, address, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl }: LoanIUpdatedProps) => {
			const response = await axios.patch(`/api/loan/${data.username}`, {
				name, address, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl
			});
			return response.data;
		},
	});

	const upload = image.length >= 1 && nidBack.length >= 1 && nidFont.length >= 1 && Form1.length >= 1 && Form2.length >= 1;

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const photosUrl = image;
		const form1 = Form1;
		const form2 = Form2;
		const nidfont = nidFont;
		const nidback = nidBack;
		const address = values.address;
		const name = values.name;
		const occupation = values.occupation;
		const phone = values.phone;
		const about = values.about;
		// Branch Created
		mutate({ name, address, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl }, {
			onSuccess: ({ message, result }: { message: string, result: LoanIProps }) => {
				if (result?.id) {
					toast.success(message);
				} else {
					throw new Error("Borrowers Updated  Failed")
				}
				router.push(`/dashboard/borrowers`);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Borrowers Updated  Failed");
			}
		});
	};
	// console.log(state, stateBranch);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
				<div className="grid items-center grid-flow-row-dense grid-cols-3 gap-3 ">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input defaultValue={data.name} placeholder="Name" {...field} />
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
									<Input defaultValue={data.address} placeholder="address" {...field} />
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
									<Input defaultValue={data.occupation} placeholder="occupation" {...field} />
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
									<Input defaultValue={data.phone} placeholder="phone" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="col-span-3">
						<FormField
							control={form.control}
							name="about"
							render={({ field }) => (
								<FormItem>
									<FormLabel>About</FormLabel>
									<FormControl>
										<Textarea rows={6} cols={50} defaultValue={data.about} placeholder="Type your message here." {...field} />
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
	)
}

export default BorrowerUpdated;