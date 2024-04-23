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
import { FaqIProps, FaqProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import UpdatedEditor from "./UpdatedEditor"





const formSchema = z.object({
	title: z.string(),
	description: z.string(),
});

function FAQUpdated({ data }: { data: FaqProps }) {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: data.title,
		}
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ title, description }: FaqIProps) => {
			const response = await axios.patch(`/api/faq/${data.id}`, {
				title, description
			});
			return response.data;
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const title = values.title;
		const description = values.description;

		mutate({ title, description }, {
			onSuccess: () => {
				toast.success("Updated Successfully");
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
				<h2 className="text-center py-2 text-color-main">Updated FAQ</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl className="p-2">
										<UpdatedEditor content={data.description} description={data.description} onChange={field.onChange} value={field.value} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{isPending ? <Button disabled >Loading...</Button> : <Button type="submit">Submit</Button>}
					</form>
				</Form>
			</div>
		</div>
	)
}

export default FAQUpdated