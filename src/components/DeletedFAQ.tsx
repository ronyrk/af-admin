"use client";
import React from 'react'
import { Button } from "@/components/ui/button"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';


function DeleteButtonFAQ({ id }: { id: string }) {
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.delete(`/api/faq/${id}`);
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
				<AlertDialogTrigger><Button className='bg-color-sub' size={"sm"}>
					Delete
				</Button></AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					</AlertDialogHeader>
					{isPending ? <Button disabled>Loading...</Button> : <AlertDialogFooter>
						<AlertDialogCancel className=' bg-color-main hover:bg-color-main'>No</AlertDialogCancel>
						<AlertDialogAction className=' bg-color-sub hover:bg-color-sub' onClick={() => handleDeleted(id)}>Yes</AlertDialogAction>
					</AlertDialogFooter>}
				</AlertDialogContent>
			</AlertDialog>

		</>
	)
}

export default DeleteButtonFAQ