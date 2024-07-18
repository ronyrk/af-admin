"use client"
import { useRouter } from 'next/navigation';
import React from 'react'
import toast from 'react-hot-toast';
import {
	AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { PaymentApproveIProps } from '@/types';
import { approvedRequest } from '@/lib/actions';

function ApproveButton({ item }: { item: PaymentApproveIProps }) {

	const router = useRouter();
	return (
		<AlertDialogAction asChild >
			<Button type='submit' onClick={async () => {
				await approvedRequest(item.id, item.loanusername, item.photoUrl, item.method, item.createAt, item.amount);
				router.refresh();
				toast.success("Payment approved successfully");
			}} className=' bg-color-main hover:bg-color-main'>Approve</Button>
		</AlertDialogAction>
	)
}

export default ApproveButton