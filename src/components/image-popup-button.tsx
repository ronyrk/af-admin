"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"

interface ImagePopupButtonProps {
    buttonText: string
    imageUrl: string
    imageAlt: string
    title?: string
    description?: string
}

export default function ImagePopupButton({
    buttonText,
    imageUrl,
    imageAlt,
    title,
    description,
}: ImagePopupButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>{buttonText}</Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md md:max-w-lg">
                    {(title || description) && (
                        <DialogHeader>
                            {title && <DialogTitle>{title}</DialogTitle>}
                            {description && <DialogDescription>{description}</DialogDescription>}
                        </DialogHeader>
                    )}

                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative w-full aspect-auto rounded-md overflow-hidden">
                            <Image
                                src={imageUrl || "/placeholder.svg"}
                                alt={imageAlt}
                                width={1000}
                                height={800}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </>
    )
}
