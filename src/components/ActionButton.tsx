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
import ApproveButton from './ApproveButton';
import { PaymentApproveIProps } from '@/types';


function ActionButton({ item }: { item: PaymentApproveIProps }) {
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.delete(`/api/approve/${id}`);
			return response.data;
		},
	});
	// // Deleted handler
	function handleDeleted(id: string) {
		mutate(item.id, {
			onSuccess: (data: any) => {
				// console.log(data);
				router.refresh();
				toast.success("Products Deleted Successfully");
			},
			onError: (error) => {
				toast.error("Products Delete Failed");
			}
		});

	}

	return (
		<>
			<AlertDialog>
				<AlertDialogTrigger><Button className='bg-color-sub' size={"sm"}>
					Action
				</Button></AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					</AlertDialogHeader>
					{isPending ? <Button disabled>Loading...</Button> : <AlertDialogFooter>
						<AlertDialogCancel className=' bg-color-main hover:bg-color-main'>Cancel</AlertDialogCancel>
						<AlertDialogCancel className=' bg-color-sub hover:bg-color-sub' onClick={() => handleDeleted(item.id)} >declined</AlertDialogCancel>
						<ApproveButton item={item} />
					</AlertDialogFooter>}
				</AlertDialogContent>
			</AlertDialog>

		</>
	)
}

export default ActionButton