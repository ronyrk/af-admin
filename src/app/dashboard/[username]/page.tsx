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
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { BranchIProps } from "@/types"
import { useState } from "react"
import { UploadButton } from "@/lib/uploadthing"

const formSchema = z.object({
	code: z.string().min(4),
	username: z.string().min(2).max(50),
	email: z.string(),
	password: z.string(),
	branchName: z.string(),
	district: z.string(),
	ps: z.string(),
	address: z.string(),
	teamLeaderName: z.string(),
	teamLeaderPhone: z.string(),
	teamLeaderAddress: z.string(),
	teamLeaderOccupation: z.string(),
	presidentName: z.string(),
	presidentAddress: z.string(),
	presidentPhone: z.string(),
	presidentOccupation: z.string(),
	ImamName: z.string(),
	ImamAddress: z.string(),
	ImamPhone: z.string(),
	ImamOccupation: z.string(),
	SecretaryName: z.string(),
	SecretaryAddress: z.string(),
	SecretaryPhone: z.string(),
	SecretaryOccupation: z.string(),
});

function BranchUpdated({ params }: {
	params: {
		username: string
	}
}) {

	const { data, isLoading } = useQuery<BranchIProps>({
		queryKey: ["branch"],
		queryFn: async () => {
			const response = await axios.get(`/api/branch/${params.username}`);
			return response.data;
		},
	});
	// console.log(data, "updated");

	const [team, setTeam] = useState<string>(data?.teamLeaderPhotoUrl as string);
	const [branch, setBranch] = useState<string[]>(data?.photoUrl as []);
	const router = useRouter();
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ username, email, password, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, code, district, ps }: BranchIProps) => {
			const response = await axios.post("/api/branch", {
				username, email, password, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, code, district, ps
			});
			return response.data;
		},
	});

	const upload = branch.length >= 1 && team.length >= 1;

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		const photoUrl = branch;
		const teamLeaderPhotoUrl = team;
		const code = values.code;
		const username = values.username;
		const email = values.email;
		const password = values.password;
		const branchName = values.branchName;
		const district = values.district;
		const ps = values.ps;
		const address = values.address;
		const teamLeaderName = values.teamLeaderName;
		const teamLeaderPhone = values.teamLeaderPhone;
		const teamLeaderAddress = values.teamLeaderAddress;
		const teamLeaderOccupation = values.teamLeaderOccupation;
		const presidentName = values.presidentName;
		const presidentAddress = values.presidentAddress;
		const presidentPhone = values.presidentPhone;
		const presidentOccupation = values.presidentOccupation;
		const ImamName = values.ImamName;
		const ImamAddress = values.ImamAddress;
		const ImamPhone = values.ImamPhone;
		const ImamOccupation = values.ImamOccupation;
		const SecretaryName = values.SecretaryName;
		const SecretaryAddress = values.SecretaryAddress;
		const SecretaryPhone = values.SecretaryPhone;
		const SecretaryOccupation = values.SecretaryOccupation;

		// Branch Created
		mutate({ username, email, password, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, code, district, ps }, {
			onSuccess: ({ message, result }: { message: string, result: BranchIProps }) => {
				if (result?.id) {
					toast.success(message);
				} else {
					throw new Error(message)
				}
				// router.push(`/dashboard`);
			},
			onError: ({ message }: { message: any }) => {
				console.log(message, "comment");
				toast.error(message);
			}
		});
	};
	// console.log(state, stateBranch);

	return (
		<div className="">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className=" flex flex-col gap-3">
						<h2 className=" text-lg text-color-main font-medium">Branch Information</h2>
						<div className=" grid grid-cols-3 gap-3 border-2 rounded p-3">
							<FormField
								control={form.control}
								name="branchName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Branch Name</FormLabel>
										<FormControl>
											<Input defaultValue={data?.branchName} placeholder="Branch Name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input defaultValue={data?.password} placeholder="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex flex-col justify-center items-center p-0">
								<Label className="pb-1">Photos</Label>
								<UploadButton
									className="ut-button:bg-color-sub mb-[-40px] ut-button:ut-readying:bg-color-sub/80"
									endpoint="branchUploader"
									onClientUploadComplete={(res) => {
										let photos = [];
										// Do something with the response
										for (const file of res) {
											photos.push(file.url);
										}
										setBranch(photos);
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
								name="district"
								render={({ field }) => (
									<FormItem>
										<FormLabel>District</FormLabel>
										<FormControl>
											<Input defaultValue={data?.district} placeholder="district" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="ps"
								render={({ field }) => (
									<FormItem>
										<FormLabel>PS</FormLabel>
										<FormControl>
											<Input defaultValue={data?.ps} placeholder="ps" {...field} />
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
											<Input defaultValue={data?.address} placeholder="address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<h2 className=" text-lg text-color-main font-medium">Team Leader Information</h2>
						<div className=" grid grid-cols-3 gap-3 border-2 rounded p-3">
							<FormField
								control={form.control}
								name="teamLeaderName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Team Leader Name</FormLabel>
										<FormControl>
											<Input defaultValue={data?.teamLeaderName} placeholder="team leader name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex flex-col justify-center items-center p-0">
								<Label className="pb-1">Team Leader Photo</Label>
								<UploadButton
									className="ut-button:bg-color-sub mb-[-30px] ut-button:ut-readying:bg-color-sub/80"
									endpoint="imageUploader"
									onClientUploadComplete={(res) => {
										// Do something with the response
										setTeam(res[0].url);
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
								name="teamLeaderPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Team Leader Phone</FormLabel>
										<FormControl>
											<Input defaultValue={data?.teamLeaderName} placeholder="team Leader Phone" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="teamLeaderAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Team Leader Address</FormLabel>
										<FormControl>
											<Input defaultValue={data?.teamLeaderAddress} placeholder="team leader Address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="teamLeaderOccupation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Team Leader Occupation</FormLabel>
										<FormControl>
											<Input defaultValue={data?.teamLeaderOccupation} placeholder="occupation" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<h2 className=" text-lg text-color-main font-medium" >President Information</h2>
						<div className=" grid grid-cols-3 gap-3 border-2 rounded p-3">
							<FormField
								control={form.control}
								name="presidentName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>President Name</FormLabel>
										<FormControl>
											<Input defaultValue={data?.presidentName} placeholder="name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="presidentAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>President Address</FormLabel>
										<FormControl>
											<Input defaultValue={data?.presidentAddress} placeholder="address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="presidentPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>President Phone</FormLabel>
										<FormControl>
											<Input defaultValue={data?.presidentPhone} placeholder="phone" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="presidentOccupation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>President Occupation</FormLabel>
										<FormControl>
											<Input defaultValue={data?.presidentOccupation} placeholder="occupation" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<h2 className=" text-lg text-color-main font-medium">Imam Information</h2>
						<div className=" grid grid-cols-3 gap-3 border-2 rounded p-3">
							<FormField
								control={form.control}
								name="ImamName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Imam Name</FormLabel>
										<FormControl>
											<Input defaultValue={data?.ImamName} placeholder="name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="ImamAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Imam Address</FormLabel>
										<FormControl>
											<Input defaultValue={data?.ImamAddress} placeholder="address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="ImamPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Imam Phone</FormLabel>
										<FormControl>
											<Input defaultValue={data?.ImamPhone} placeholder="phone" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="ImamOccupation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Imam Occupation</FormLabel>
										<FormControl>
											<Input defaultValue={data?.ImamOccupation} placeholder="occupation" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<h2 className=" text-lg text-color-main font-medium">Secretary Information</h2>
						<div className=" grid grid-cols-3 gap-3 border-2 rounded p-3">
							<FormField
								control={form.control}
								name="SecretaryName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Secretary Name</FormLabel>
										<FormControl>
											<Input defaultValue={data?.SecretaryName} placeholder="name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="SecretaryAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Secretary Address</FormLabel>
										<FormControl>
											<Input defaultValue={data?.SecretaryAddress} placeholder="name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="SecretaryPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Secretary Phone</FormLabel>
										<FormControl>
											<Input defaultValue={data?.SecretaryPhone} placeholder="phone" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="SecretaryOccupation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Secretary Occupation</FormLabel>
										<FormControl>
											<Input defaultValue={data?.SecretaryOccupation} placeholder="occupation" {...field} />
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
		</div>
	)
}

export default BranchUpdated;