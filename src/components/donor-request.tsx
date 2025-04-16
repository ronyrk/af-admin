"use client"

import { useState, useEffect, useOptimistic } from "react"
import { format } from "date-fns"
import { Copy, Eye, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

import { DonorRequestIProps } from "@/types"
import { deleteEntry, fetchEntries } from "@/lib/actions"
import ImagePopupButton from "./image-popup-button"

export default function DataEntryDisplay() {
    const [data, setData] = useState<DonorRequestIProps[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedEntry, setSelectedEntry] = useState<DonorRequestIProps | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast();

    console.log(selectedEntry);

    // Optimistic UI state
    const [optimisticData, updateOptimisticData] = useOptimistic(data, (state, deletedId: string) =>
        state.filter((item) => item.id !== deletedId),
    )

    // Fetch data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const entries = await fetchEntries()
                console.log({ entries });
                setData(entries)
                setError(null)
            } catch (err) {
                setError("Failed to load data. Please try again later.")
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load data. Please try again later.",
                })
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [toast])

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy • h:mm a")
        } catch (error) {
            return dateString
        }
    }

    // Handle delete action - show confirmation dialog
    const handleDelete = (id: string) => {
        setDeleteConfirmId(id)
    }

    // Handle actual deletion after confirmation
    const confirmDelete = async () => {
        if (deleteConfirmId) {
            try {
                setIsDeleting(true)

                // Apply optimistic update immediately
                updateOptimisticData(deleteConfirmId)

                // Close the confirmation dialog right away for better UX
                setDeleteConfirmId(null)

                // Show optimistic toast
                toast({
                    title: "Deleting entry...",
                    description: "The data entry is being removed.",
                })

                // Perform the actual server action
                const result = await deleteEntry(deleteConfirmId)

                if (result.success) {
                    // Update the actual data state to match the server
                    setData((current) => current.filter((entry) => entry.id !== deleteConfirmId))

                    toast({
                        title: "Entry deleted",
                        description: "The data entry has been removed successfully.",
                    })
                } else {
                    throw new Error(result.error || "Failed to delete entry")
                }
            } catch (err) {
                // If there's an error, we need to revert our optimistic update
                // by refetching the data
                const refreshedData = await fetchEntries()
                setData(refreshedData)

                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to delete entry. Please try again.",
                })
            } finally {
                setIsDeleting(false)
            }
        }
    }

    // Cancel deletion
    const cancelDelete = () => {
        setDeleteConfirmId(null)
    }

    // Handle view action
    const handleView = (entry: DonorRequestIProps) => {
        setSelectedEntry(entry)
        setIsModalOpen(true)
    }

    // Copy to clipboard
    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied to clipboard",
            description: `${fieldName} has been copied to your clipboard.`,
        })
    }

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading data entries...</p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto py-12">
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                    <p>{error}</p>
                    <Button className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Data Entries</h1>

            {/* Empty state */}
            {optimisticData.length === 0 && (
                <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground">No data entries found.</p>
                </div>
            )}

            {/* Desktop view - Table */}
            {optimisticData.length > 0 && (
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {optimisticData.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.name}</TableCell>
                                    <TableCell>{formatDate(entry.createAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" onClick={() => handleView(entry)}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Mobile view - Cards */}
            {optimisticData.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {optimisticData.map((entry) => (
                        <Card key={entry.id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-medium">{entry.name}</h3>
                                        <p className="text-sm text-muted-foreground">{formatDate(entry.createAt)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleView(entry)}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View</span>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md sm:max-w-lg">
                    {selectedEntry && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedEntry.name}</DialogTitle>
                                <DialogDescription>Created on {formatDate(selectedEntry.createAt)}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                {Object.entries(selectedEntry).map(([key, value]) => (
                                    <div key={key} className="grid grid-cols-3 items-center gap-4">
                                        <label className="text-sm font-medium capitalize col-span-1">
                                            {key.replace(/([A-Z])/g, " $1").trim()}:
                                        </label>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <div className="text-sm truncate max-w-[200px]">
                                                {key === "createAt" || key === "return_date"
                                                    ? formatDate(value.toString())
                                                    : key === "amount"
                                                        ? `$${value}`
                                                        : value.toString()}
                                            </div>
                                            <Button
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => copyToClipboard(value.toString(), key)}
                                            >
                                                <Copy className="h-4 w-4" />
                                                <span className="sr-only">Copy {key}</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Conditional rendering for mobile-banking or invoice */}
                                {selectedEntry.method === "mobile-banking" ? (
                                    <>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <span className="font-medium">Mobile Number:</span>
                                            <span className="col-span-2">{selectedEntry.sendNumber}</span>
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <span className="font-medium">Transaction ID:</span>
                                            <span className="col-span-2">{selectedEntry.transactionId}</span>
                                        </div>
                                    </>
                                ) : (
                                    <ImagePopupButton
                                        buttonText="View Invoice"
                                        imageUrl={`${selectedEntry.invoice}?height=800&width=1000`}
                                        imageAlt="Sample receipt image"
                                    />
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this entry? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={cancelDelete} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Yes, Delete"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
