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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { CategoryIProps, FaqIProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import TailwindEditor from "@/components/editor"





const formSchema = z.object({
	name: z.string(),
	path: z.string(),
});

function CreateFAQ() {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ name, path }: CategoryIProps) => {
			const response = await axios.post("/api/category", {
				name, path
			});
			return response.data;
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const name = values.name;
		const path = values.path;

		mutate({ name, path }, {
			onSuccess: (data: CategoryIProps) => {
				if (data.id) {
					toast.success("Create Successfully");
				} else {
					throw new Error("Branch Created Failed")
				}
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
				<h2 className="text-center py-2 text-color-main">Create Category</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
							name="path"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Path</FormLabel>
									<FormControl>
										<Input placeholder="path" {...field} />
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