"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { useRouter } from "next/navigation"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { LoginIProps } from "@/types"
import toast from "react-hot-toast"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"



const formSchema = z.object({
	email: z.string(),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
});

export function SingInForm() {
	const [showPassword, setShowPassword] = useState(false);
	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const router = useRouter();
	// Login
	const { mutate, isPending } = useMutation({
		mutationFn: async ({ email, password }: LoginIProps) => {
			const response = await axios.post("/api/login", {
				email, password
			});
			return response.data;
		},
	});

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	});
	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const email = values.email;
		const password = values.password;
		mutate({ email, password }, {
			onSuccess: ({ message, user }: { message: string, user: any }) => {
				if (user?.username) {
					toast.success(message);
					router.push(`/dashboard`)
				} else {
					toast.error("Login Failed")
				}
			},
			onError: (error) => {
				toast.error("Login Failed");
			}
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl >
								<Input className="appearance-none border rounded w-full text-base py-[20px] px-3 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="example@gmail.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className=" relative">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl >
									<Input className="appearance-none border rounded w-full text-base py-[20px] px-3 leading-tight focus:outline-none focus:shadow-outline" type={showPassword ? 'text' : 'password'} placeholder="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div
						className="absolute  bottom-3 right-0 pr-3 flex items-center cursor-pointer"
						onClick={togglePasswordVisibility}
					>
						{showPassword ? (
							<EyeOff size={20} />
						) : (

							<Eye size={20} />
						)}
					</div>
				</div>
				{isPending ? <Button disabled>Loading...</Button> : <Button type="submit">Login</Button>}
			</form>
		</Form>
	);
};