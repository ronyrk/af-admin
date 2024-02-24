import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react'
import toast from 'react-hot-toast';
import {
	AlertDialogAction,

} from "@/components/ui/alert-dialog"
import { PaymentApproveIProps } from '@/types';

function ApproveButton({ item }: { item: PaymentApproveIProps }) {
	const router = useRouter();
	const { id, amount, loanusername, method, createAt, photoUrl } = item;
	const { mutate, isPending } = useMutation({
		mutationFn: async ({ id, amount, loanusername, method, createAt, photoUrl }: PaymentApproveIProps) => {
			const response = await axios.post(`/api/approve/${id}`, {
				amount, loanusername, method, createAt, photoUrl
			});
			return response.data;
		},
	});
	// Approve handler
	function handleApprove(id: string) {
		mutate({ id, amount, loanusername, method, createAt, photoUrl }, {
			onSuccess: (data: any) => {
				// console.log(data);
				toast.success("Payment Request approve Successfully");
				router.refresh();
			},
			onError: (error) => {
				toast.error("Payment Request approve Successfully");
			}
		});

	}
	return (
		<>
			<AlertDialogAction className=' bg-color-main hover:bg-color-main' onClick={() => handleApprove(id)} >Approve</AlertDialogAction>
		</>
	)
}

export default ApproveButton