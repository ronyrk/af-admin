"use client"

import { useState, useOptimistic } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { approveEntry, deleteDonorPaymentRequest, getDonorData } from "@/lib/actions"
import { DonorIProps, DonorPaymentRequestIProps } from "@/types"

interface DataEntryListProps {
    initialEntries: DonorPaymentRequestIProps[]
}

export default function DonorPaymentRequest({ initialEntries }: DataEntryListProps) {
    // State for the dialog
    const [selectedEntry, setSelectedEntry] = useState<DonorPaymentRequestIProps | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [isLoadingDonor, setIsLoadingDonor] = useState(false)
    const [donorData, setDonorData] = useState<DonorIProps | null>(null);

    // Optimistic UI updates
    const [optimisticEntries, updateOptimisticEntries] = useOptimistic(
        initialEntries,
        (state, { action, id }: { action: "delete"; id: string }) => {
            if (action === "delete") {
                return state.filter((entry) => entry.id !== id)
            }
            return state
        },
    )

    // // Format currency
    // const formatCurrency = (amount: number) => {
    //     return `BDT=${new Intl.NumberFormat("en-BD", {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //     }).format(amount)}`;
    // }

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy HH:mm")
        } catch (error) {
            return dateString
        }
    }

    // Handle view button click
    // Handle view button click
    const handleView = async (entry: DonorPaymentRequestIProps) => {
        setSelectedEntry(entry)
        setIsDialogOpen(true)
        setIsLoadingDonor(true)
        setDonorData(null)

        try {
            const result = await getDonorData(entry.username)

            if (result.success && result.data) {
                setDonorData(result.data)
            } else if (!result.success) {
                toast({
                    title: "Error",
                    description: result.error || "Failed to fetch donor data",
                    variant: "destructive",
                })
            } else {
                // No donor data found
                toast({
                    title: "No donor data",
                    description: `No donor information found for ${entry.username}`,
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred while fetching donor data",
                variant: "destructive",
            })
            console.error("Error fetching donor data:", error)
        } finally {
            setIsLoadingDonor(false)
        }
    }

    // Handle delete button click in the list
    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            setIsPending(true)

            // Optimistic update
            updateOptimisticEntries({ action: "delete", id });


            try {
                const result = await deleteDonorPaymentRequest(id)

                if (result.success) {
                    toast({
                        title: "Entry deleted",
                        description: "The entry has been successfully deleted.",
                    })
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to delete the entry. Please try again.",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                })
                console.error("Error deleting entry:", error)
            } finally {
                setIsPending(false)
            }
        }
    }

    // Handle approve button click in the modal
    const handleApprove = async () => {
        if (!selectedEntry) return

        setIsPending(true)
        try {
            const result = await approveEntry(selectedEntry)

            if (result.success) {
                toast({
                    title: "Entry approved",
                    description: "The entry has been successfully approved.",
                })
                setIsDialogOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to approve the entry. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
            console.error("Error approving entry:", error)
        } finally {
            setIsPending(false)
        }
    }

    // Handle delete button click in the modal
    const handleDeleteFromModal = async () => {
        if (!selectedEntry) return
        setIsDialogOpen(false)
        await handleDelete(selectedEntry.id)
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {optimisticEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No entries found
                                </TableCell>
                            </TableRow>
                        ) : (
                            optimisticEntries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.username}</TableCell>
                                    <TableCell>{formatDate(entry.createAt)}</TableCell>
                                    <TableCell>BDT={entry.amount}/=</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleView(entry)} disabled={isPending}>
                                                View
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(entry.id)}
                                                disabled={isPending}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {selectedEntry && (
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Entry Details</DialogTitle>
                            <DialogDescription>View complete information for this entry.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Code:</span>
                                <span className="col-span-2">{donorData?.code}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Name:</span>
                                <span className="col-span-2">{donorData?.name}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Mobile:</span>
                                <span className="col-span-2">{donorData?.mobile}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Lives:</span>
                                <span className="col-span-2">{donorData?.lives}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">HomeTown:</span>
                                <span className="col-span-2">{donorData?.hometown}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Amount:</span>
                                <span className="col-span-2">{selectedEntry.amount}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Method:</span>
                                <span className="col-span-2">{selectedEntry.method}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Return Date:</span>
                                <span className="col-span-2">{formatDate(selectedEntry.return_date)}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium">Created At:</span>
                                <span className="col-span-2">{formatDate(selectedEntry.createAt)}</span>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-between">
                            <Button variant="destructive" onClick={handleDeleteFromModal} disabled={isPending}>
                                Delete
                            </Button>
                            <Button onClick={handleApprove} disabled={isPending}>
                                Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )
}
