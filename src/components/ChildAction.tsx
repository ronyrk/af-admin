"use client";
import React from 'react'
import { Button } from "@/components/ui/button"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ChildDonateRequestProps, DonateProps, SponsorProps } from '@/types';
import { useFormStatus } from 'react-dom';
import SponsorApprove from './SponsorApprove';


function ChildAction({ item }: { item: ChildDonateRequestProps }) {
	// console.log(item, "child Action-24");
	const router = useRouter();
	const { pending } = useFormStatus()

	const { mutate, isPending } = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.delete(`/api/child-sponsor/${id}`);
			return response.data;
		},
	});
	// // Deleted handler
	function handleDeleted(id: string) {
		mutate(id, {
			onSuccess: (data: any) => {
				// console.log(data);
				router.refresh();
				toast.success(" Deleted Successfully");
			},
			onError: (error) => {
				toast.error("Delete Failed");
			}
		});

	}

	return (
		<>
			<AlertDialog>
				<AlertDialogTrigger><Button aria-disabled={pending} className='bg-color-sub' size={"sm"}>
					{
						pending ? "Loading..." : "Action"
					}
				</Button></AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					</AlertDialogHeader>
					{isPending ? <Button disabled>Loading...</Button> : <AlertDialogFooter>
						<AlertDialogCancel className=' bg-color-main hover:bg-color-main'>Cancel</AlertDialogCancel>
						<AlertDialogCancel className=' bg-color-sub hover:bg-color-sub' onClick={() => handleDeleted(item?.id as any)} >declined</AlertDialogCancel>
						<SponsorApprove item={item} />
					</AlertDialogFooter>}
				</AlertDialogContent>
			</AlertDialog>

		</>
	)
}

export default ChildAction