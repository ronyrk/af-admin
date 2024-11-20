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
import DonorDonationPayment from './DonorDonationPayment';

function LenderTableContext({ username }: { username: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger><Button >Payment</Button></DialogTrigger>
                <DialogContent>
                    <DonorDonationPayment setOpen={setOpen} username={username} />
                </DialogContent>
            </Dialog>

        </>
    )
}

export default LenderTableContext