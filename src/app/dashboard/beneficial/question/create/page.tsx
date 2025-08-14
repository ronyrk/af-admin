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
import { FaqIProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import TailwindEditor from "@/components/editor"





const formSchema = z.object({
	title: z.string(),
	description: z.string(),
});

function CreateFAQ() {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ title, description }: FaqIProps) => {
			const response = await axios.post("/api/beneficial/faq", {
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
			onSuccess: (data: FaqIProps) => {
				if (data.id) {
					toast.success("Create Successfully FAQ");
				} else {
					throw new Error("Created Failed")
				}
				router.push('/dashboard/beneficial/question');
				router.refresh();
			},
			onError: (error) => {
				toast.error("Created Failed");
			}
		});
		// console.log(values, "result");
	}
	return (
		<div>
			<div className="p-2">
				<h2 className="text-center py-2 text-color-main">Create FAQ</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl className="p-2">
										<TailwindEditor description={field.name} onChange={field.onChange} value={field.value} />
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

export default CreateFAQ