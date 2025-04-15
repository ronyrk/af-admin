import React from 'react'
import prisma from '@/lib/prisma'

export default async function page() {
    const request = await prisma.donor_payment_request.findMany({});
    console.log(request)
    return (
        <div>page</div>
    )
}
