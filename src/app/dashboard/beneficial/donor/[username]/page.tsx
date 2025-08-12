import { cookies } from 'next/headers'
import React from 'react'
import prisma from '@/lib/prisma';
import { BeneficialDonorIProps } from '@/types';
import BeneficialDonorProfileEdit from '@/components/beneficial-donor-profile';

async function page({ params }: { params: Promise<{ username: string }> }) {
    cookies();
    const { username } = await params;
    const beneficialDonor = await prisma.beneficialDonor.findUnique({
        where: { username },
        include: {
            beneficialTransaction: true
        }
    }) as BeneficialDonorIProps;
    return (
        <div>
            <BeneficialDonorProfileEdit data={beneficialDonor} />
        </div>
    )
}

export default page