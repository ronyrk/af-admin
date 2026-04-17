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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { BranchIProps, LoanIProps } from "@/types"
import { useCallback, useMemo, useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/components/auth-provider"

// ─── Constants ────────────────────────────────────────────────────────────────

const BRANCH_STALE_TIME = 5 * 60 * 1000 // 5 minutes — branch list rarely changes

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
	code: z.string().min(4, "Code must be at least 4 characters"),
	username: z.string().min(1, "Username is required"),
	branch: z.string().min(1, "Branch is required"),
	balance: z.string().min(1, "Amount is required"),
	about: z.string().optional(),
	phone: z.string().min(1, "Phone is required"),
	occupation: z.string().min(1, "Occupation is required"),
	address: z.string().min(1, "Address is required"),
	name: z.string().min(1, "Name is required"),
})

type FormValues = z.infer<typeof formSchema>

// ─── Upload State ──────────────────────────────────────────────────────────────

type UploadState = {
	image: string
	nidFont: string
	nidBack: string
	form1: string
	form2: string
}

const INITIAL_UPLOADS: UploadState = {
	image: "",
	nidFont: "",
	nidBack: "",
	form1: "",
	form2: "",
}

// ─── Helpers (outside component — stable references) ──────────────────────────

/** Replaces whitespace with hyphens for username formatting */
const formatUsername = (value: string) => value.replace(/\s/g, "-")

/** Extracts a user-facing error message from Axios or unknown errors */
const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		return error.response?.data?.message ?? error.message
	}
	if (error instanceof Error) return error.message
	return "Something went wrong"
}

// ─── Upload Field Component ────────────────────────────────────────────────────

type UploadFieldProps = {
	label: string
	uploaded: boolean
	onUploadComplete: (url: string) => void
}

function UploadField({ label, uploaded, onUploadComplete }: UploadFieldProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-1">
			<Label className="pb-1">
				{label}
				{uploaded && (
					<span className="ml-1 text-xs text-green-500">✓</span>
				)}
			</Label>
			<UploadButton
				className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
				endpoint="imageUploader"
				onClientUploadComplete={(res) => {
					onUploadComplete(res[0].url)
					toast.success(`${label} uploaded`)
				}}
				onUploadError={(error: Error) => {
					toast.error(error.message)
				}}
			/>
		</div>
	)
}

// ─── Main Component ────────────────────────────────────────────────────────────

function BorrowerCreate() {
	const [uploads, setUploads] = useState<UploadState>(INITIAL_UPLOADS)
	const router = useRouter()
	const { user } = useAuthContext()
	const queryClient = useQueryClient()

	// All 5 uploads must be present before submission is allowed
	const isUploadComplete = useMemo(
		() => Object.values(uploads).every((url) => url.length > 0),
		[uploads]
	)

	// Stable setter — avoids re-creating a new function per upload field
	const handleUpload = useCallback(
		(key: keyof UploadState) => (url: string) => {
			setUploads((prev) => ({ ...prev, [key]: url }))
		},
		[]
	)

	// ── Form ──────────────────────────────────────────────────────────────────

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			code: "",
			username: "",
			name: "",
			branch: "",
			address: "",
			balance: "",
			occupation: "",
			phone: "",
			about: "",
		},
	})

	// ── Branch Query ──────────────────────────────────────────────────────────

	const { data: branches, isLoading: branchesLoading } = useQuery<BranchIProps[]>({
		queryKey: ["branch"],
		queryFn: async () => {
			const response = await axios.get("/api/branch")
			return response.data
		},
		staleTime: BRANCH_STALE_TIME,     // use cached data for 5 min
		gcTime: BRANCH_STALE_TIME * 2,    // keep in cache for 10 min
	})

	// ── Mutation ──────────────────────────────────────────────────────────────

	const { mutate, isPending } = useMutation({
		mutationFn: async (payload: LoanIProps) => {
			const response = await axios.post("/api/loan", payload)
			return response.data
		},
		onSuccess: ({ message, loan }: { message: string; loan: LoanIProps }) => {
			if (loan?.id) {
				toast.success(message)
				// Invalidate borrowers list so it reflects the new entry
				queryClient.invalidateQueries({ queryKey: ["borrowers"] })
			} else {
				toast.error(message)
			}
			router.push("/dashboard/borrowers")
			router.refresh()
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error))
		},
	})

	// ── Submit Handler ────────────────────────────────────────────────────────

	function onSubmit(values: FormValues) {
		if (!isUploadComplete) {
			toast.error("Please upload all required photos before submitting")
			return
		}

		mutate({
			...values,
			photosUrl: uploads.image,
			form1: uploads.form1,
			form2: uploads.form2,
			nidfont: uploads.nidFont,
			nidback: uploads.nidBack,
		})
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className="grid grid-flow-row-dense grid-cols-3 items-center gap-3">

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

						{/* Username */}
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder="Username"
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
										<Input placeholder="Name" {...field} />
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
														branchesLoading
															? "Loading branches..."
															: "Select a branch"
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

						{/* Address */}
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input placeholder="Address" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Balance */}
						<FormField
							control={form.control}
							name="balance"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Amount" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Upload Fields */}
						<UploadField
							label="Profile Picture"
							uploaded={!!uploads.image}
							onUploadComplete={handleUpload("image")}
						/>
						<UploadField
							label="Form One Picture"
							uploaded={!!uploads.form1}
							onUploadComplete={handleUpload("form1")}
						/>
						<UploadField
							label="Form Two Picture"
							uploaded={!!uploads.form2}
							onUploadComplete={handleUpload("form2")}
						/>
						<UploadField
							label="NID Front Picture"
							uploaded={!!uploads.nidFont}
							onUploadComplete={handleUpload("nidFont")}
						/>
						<UploadField
							label="NID Back Picture"
							uploaded={!!uploads.nidBack}
							onUploadComplete={handleUpload("nidBack")}
						/>

						{/* Occupation */}
						<FormField
							control={form.control}
							name="occupation"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Occupation</FormLabel>
									<FormControl>
										<Input placeholder="Occupation" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Phone */}
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone</FormLabel>
									<FormControl>
										<Input placeholder="Phone" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* About */}
						<div className="col-span-2">
							<FormField
								control={form.control}
								name="about"
								render={({ field }) => (
									<FormItem>
										<FormLabel>About</FormLabel>
										<FormControl>
											<Textarea
												rows={4}
												placeholder="Type your message here."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Submit */}
					<Button
						type="submit"
						disabled={isPending || !isUploadComplete}
					>
						{isPending ? "Submitting..." : "Submit"}
					</Button>
				</form>
			</Form>
		</div>
	)
}

export default BorrowerCreate