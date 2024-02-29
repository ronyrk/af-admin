import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react'
import toast from 'react-hot-toast';
import {
	AlertDialogAction,

} from "@/components/ui/alert-dialog"
import { PaymentApproveIProps } from '@/types';
import { deleteRequest } from '@/lib/actions';

function ApproveButton({ item }: { item: PaymentApproveIProps }) {
	const deletedList = deleteRequest.bind(null, item);
	const router = useRouter();
	return (
		<>
			<form action={deletedList}>
				<AlertDialogAction type='submit' onClick={() => {
					router.refresh();
					toast.success("Approved Successfully");
				}} className=' bg-color-main hover:bg-color-main' >Approve</AlertDialogAction>
			</form>

		</>
	)
}

export default ApproveButton