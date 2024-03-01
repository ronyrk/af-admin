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


function DeleteButton({ username, type }: { username: string, type: string }) {
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		mutationFn: async (username: string) => {
			const response = await axios.delete(`/api/${type}/${username}`);
			return response.data;
		},
	});
	// // Deleted handler
	function handleDeleted(username: string) {
		mutate(username, {
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
					Delete
				</Button></AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					</AlertDialogHeader>
					{isPending ? <Button disabled>Loading...</Button> : <AlertDialogFooter>
						<AlertDialogCancel className=' bg-color-main hover:bg-color-main'>No</AlertDialogCancel>
						<AlertDialogAction className=' bg-color-sub hover:bg-color-sub' onClick={() => handleDeleted(username)}>Yes</AlertDialogAction>
					</AlertDialogFooter>}
				</AlertDialogContent>
			</AlertDialog>

		</>
	)
}

export default DeleteButton