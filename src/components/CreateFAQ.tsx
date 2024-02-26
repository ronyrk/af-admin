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
import { FaqIProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"




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
			const response = await axios.post("/api/faq", {
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
			<Dialog>
				<DialogTrigger>
					<Button>Create FAQ</Button>
				</DialogTrigger>
				<div className="px-8">
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>Create FAQ</DialogTitle>
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
												<FormControl>
													<Textarea placeholder="Type your message here." {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button type="submit">Submit</Button>
								</form>
							</Form>
						</DialogHeader>
					</DialogContent>
				</div>
			</Dialog>
		</div>
	)
}

export default CreateFAQ