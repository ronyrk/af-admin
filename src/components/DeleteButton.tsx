"use client";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteButtonProps {
	username: string;
	type: string;
}

export default function DeleteButton({ username, type }: DeleteButtonProps) {
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			axios.delete(`/api/${type}/${username}`).then((r) => r.data),
		onSuccess: () => {
			toast.success("Deleted successfully");
			router.refresh();
		},
		onError: (error: any) => {
			const message =
				error?.response?.data?.error ?? "Delete failed. Please try again.";
			toast.error(message);
		},
	});

	return (
		<AlertDialog>
			{/* ✅ asChild prevents <button> inside <button> */}
			<AlertDialogTrigger asChild>
				<Button
					className="bg-color-sub"
					size="sm"
					aria-label={`Delete ${type}`}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete this {type} and all related data. This
						action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{/* ✅ Footer always visible, buttons disabled during pending */}
				<AlertDialogFooter>
					<AlertDialogCancel
						className="bg-color-main hover:bg-color-main"
						disabled={isPending}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="bg-color-sub hover:bg-color-sub"
						disabled={isPending}
						onClick={() => mutate()}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Yes, Delete"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}