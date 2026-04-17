"use client"

import { useMemo } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
	Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UploadButton } from "@/lib/uploadthing"
import { useAuthContext } from "@/components/auth-provider"
import { BranchIProps, DonorIProps } from "@/types"

// ── Constants ────────────────────────────────────────────────────────────────
// Defined outside the component so they are stable references (not re-created
// on every render) and won't invalidate React Query's staleTime comparison.
const BRANCH_STALE_TIME = 5 * 60 * 1000 // 5 min
const BRANCH_GC_TIME = BRANCH_STALE_TIME * 2 // 10 min

// ── Schema ───────────────────────────────────────────────────────────────────
const formSchema = z.object({
	code: z.string().min(4, "Code must be at least 4 characters"),
	username: z.string().min(2).max(50),
	email: z.string().email("Enter a valid email").or(z.literal("")),
	password: z.string().min(6, "Password must be at least 6 characters"),
	about: z.string().optional().default(""),
	amount: z.string().default("0"),
	lives: z.string().optional().default(""),
	hometown: z.string().optional().default(""),
	status: z.string().min(1, "Please select a type"),
	name: z.string().min(1, "Name is required"),
	branch: z.string().min(1, "Please select a branch"),
	socailMedia1: z.string().url("Enter a valid URL").or(z.literal("")),
	socailMedia2: z.string().url("Enter a valid URL").or(z.literal("")),
	mobile: z.string().optional().default(""),
})

type FormValues = z.infer<typeof formSchema>

// ── Helper ───────────────────────────────────────────────────────────────────
// Pure function — no need to live inside the component.
const formatUsername = (value: string) => value.replace(/\s/g, "-")

// ── Component ─────────────────────────────────────────────────────────────────
function DonorCreate() {
	const router = useRouter()
	const { user } = useAuthContext()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: "0",
			about: "",
			lives: "",
			hometown: "",
			socailMedia1: "",
			socailMedia2: "",
			mobile: "",
		},
	})

	// Watch the photo URL through form state instead of separate useState so the
	// form is the single source of truth and the upload indicator re-renders only
	// when this specific field changes.
	const photoUrl = form.watch("_photoUrl" as any, "") as string
	const setPhotoUrl = (url: string) =>
		form.setValue("_photoUrl" as any, url, { shouldDirty: true })

	const hasPhoto = useMemo(() => photoUrl.length > 0, [photoUrl])

	// ── Branch Query ────────────────────────────────────────────────────────────
	const { data: branches, isLoading: branchesLoading } = useQuery<BranchIProps[]>({
		queryKey: ["branch"],
		queryFn: async () => {
			const { data } = await axios.get<BranchIProps[]>("/api/branch")
			return data
		},
		staleTime: BRANCH_STALE_TIME,
		gcTime: BRANCH_GC_TIME,
	})

	// ── Mutation ────────────────────────────────────────────────────────────────
	const { mutate, isPending } = useMutation({
		mutationFn: (payload: DonorIProps) =>
			axios.post<{ message: string; result: BranchIProps }>("/api/donor", payload)
				.then((r) => r.data),
		onSuccess: ({ message, result }) => {
			if (!result?.id) throw new Error("Donor creation failed")
			toast.success(message)
			router.push("/dashboard/donor")
			router.refresh()
		},
		onError: (error: Error) => {
			toast.error(error.message ?? "Something went wrong")
		},
	})

	// ── Submit ──────────────────────────────────────────────────────────────────
	function onSubmit(values: FormValues) {
		if (!hasPhoto) {
			toast.error("Please upload a photo before submitting")
			return
		}

		mutate({
			username: values.username,
			email: values.email,
			code: values.code,
			password: values.password,
			name: values.name,
			photoUrl,
			about: values.about ?? "",
			amount: values.amount,
			lives: values.lives ?? "",
			hometown: values.hometown ?? "",
			status: values.status,
			socailMedia1: values.socailMedia1,
			socailMedia2: values.socailMedia2,
			mobile: values.mobile ?? "",
			// branch is used for filtering/display but mapped server-side;
			// include it if your API expects it:
			branch: values.branch,
		} as DonorIProps)
	}

	// ── Render ──────────────────────────────────────────────────────────────────
	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className="grid grid-cols-3 items-center gap-3">

						{/* Code */}
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Code</FormLabel>
									<FormControl>
										<Input placeholder="Code" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Branch */}
						<FormField
							control={form.control}
							name="branch"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Branch</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={branchesLoading}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														branchesLoading ? "Loading branches…" : "Select a branch"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{user?.role === "admin"
												? branches?.map((item) => (
													<SelectItem key={item.id} value={item.username}>
														{item.branchName}
													</SelectItem>
												))
												: (
													<SelectItem value={user?.username as string}>
														{user?.username}
													</SelectItem>
												)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Username */}
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder="username"
											{...field}
											onChange={(e) =>
												field.onChange(formatUsername(e.target.value))
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Name */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Full name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Email */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="email@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Password */}
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Photo Upload */}
						<div className="flex flex-col justify-center items-center p-0">
							<Label className="pb-1">
								Photo {hasPhoto && <span className="text-green-500">✓</span>}
							</Label>
							<UploadButton
								className="ut-button:bg-color-sub mb-[-40px] ut-button:ut-readying:bg-color-sub/80"
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									setPhotoUrl(res[0].url)
									toast.success("Image uploaded successfully")
								}}
								onUploadError={(error: Error) => {
									toast.error(error.message)
								}}
							/>
						</div>

						{/* Facebook */}
						<FormField
							control={form.control}
							name="socailMedia2"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Facebook</FormLabel>
									<FormControl>
										<Input type="url" placeholder="https://facebook.com/..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* LinkedIn */}
						<FormField
							control={form.control}
							name="socailMedia1"
							render={({ field }) => (
								<FormItem>
									<FormLabel>LinkedIn</FormLabel>
									<FormControl>
										<Input type="url" placeholder="https://linkedin.com/in/..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Mobile */}
						<FormField
							control={form.control}
							name="mobile"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mobile</FormLabel>
									<FormControl>
										<Input type="tel" placeholder="+1 234 567 8900" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Lives */}
						<FormField
							control={form.control}
							name="lives"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Lives</FormLabel>
									<FormControl>
										<Input placeholder="Current city" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Hometown */}
						<FormField
							control={form.control}
							name="hometown"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Hometown</FormLabel>
									<FormControl>
										<Input placeholder="Hometown" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Donor or Lender */}
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Donor or Lender</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="LEADER">LENDER</SelectItem>
											<SelectItem value="DONOR">DONOR</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* About */}
						<FormField
							control={form.control}
							name="about"
							render={({ field }) => (
								<FormItem>
									<FormLabel>About</FormLabel>
									<FormControl>
										<Textarea placeholder="Brief bio or description…" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

					</div>

					<Button
						type="submit"
						disabled={!hasPhoto || isPending}
					>
						{isPending ? "Saving…" : "Submit"}
					</Button>

				</form>
			</Form>
		</div>
	)
}

export default DonorCreate