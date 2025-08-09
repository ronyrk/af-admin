import { cookies } from 'next/headers'
import React from 'react'
import prisma from '@/lib/prisma';
import BeneficialDonorUpdated from '@/components/beneficial-donor-update';
import { BeneficialDonorIProps } from '@/types';

async function page({ params }: { params: Promise<{ username: string }> }) {
    cookies();
    const { username } = await params;
    const beneficialDonor = await prisma.beneficialDonor.findUnique({
        where: { username }
    }) as BeneficialDonorIProps;
    return (
        <div>
            <BeneficialDonorUpdated params={beneficialDonor} />
        </div>
    )
}

export default page