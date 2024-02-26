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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"




const formSchema = z.object({
	title: z.string(),
	description: z.string(),
});

function CreateFAQ() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const title = values.title;
		const description = values.description;
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
													<ReactQuill {...field} />
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