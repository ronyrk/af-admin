import React from 'react'
import prisma from '@/lib/prisma';

async function page() {
    const data = await prisma.beneficial.findMany({
        include: {
            beneficialDonor: true
        }
    });
    console.log(data);
    return (
        <div>Beneficial</div>
    )
}

export default page;