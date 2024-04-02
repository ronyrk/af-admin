import { useRouter } from 'next/navigation';
import React from 'react'
import toast from 'react-hot-toast';
import {
	AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { SponsorProps } from '@/types';
import { ApproveChildSponsor } from '@/lib/actions';

function SponsorApprove({ item }: { item: SponsorProps }) {
	const deletedList = ApproveChildSponsor.bind(null, item);
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

export default SponsorApprove