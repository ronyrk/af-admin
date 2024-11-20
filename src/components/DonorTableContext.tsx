"use client";
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import DonorDonationCreate from './DonorDonationCreate';



function DonorTableContext({ username }: { username: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger><Button >Add Payment</Button></DialogTrigger>
                <DialogContent>
                    <DonorDonationCreate setOpen={setOpen} username={username} />
                </DialogContent>
            </Dialog>

        </>
    )
}

export default DonorTableContext