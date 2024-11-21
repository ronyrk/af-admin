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
import LenderDonationCreate from './LenderDonationCreate';



function DonorTableContext({ username, status }: { username: string, status: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger><Button >Deposit</Button></DialogTrigger>
                <DialogContent>
                    {
                        status === "LEADER" ? <LenderDonationCreate setOpen={setOpen} username={username} /> : <DonorDonationCreate setOpen={setOpen} username={username} />
                    }
                </DialogContent>
            </Dialog>

        </>
    )
}

export default DonorTableContext