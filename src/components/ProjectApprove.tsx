import { useRouter } from 'next/navigation';
import React from 'react'
import toast from 'react-hot-toast';
import {
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { ApproveChildSponsor, ApproveProjectRequest } from '@/lib/actions';
import { ChildDonateRequestProps, ProjectDonateRequestProps } from '@/types';

function ProjectApprove({ item }: { item: ProjectDonateRequestProps }) {
    const deletedList = ApproveProjectRequest.bind(null, item);
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

export default ProjectApprove