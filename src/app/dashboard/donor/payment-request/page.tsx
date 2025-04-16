import DonorPaymentRequest from '@/components/donor-payment-request';
import { getDonorPaymentRequests } from '@/lib/actions';
import { cookies } from 'next/headers'
import React from 'react'

export default async function page() {
    cookies();
    const entries = await getDonorPaymentRequests();
    return (
        <div>
            <DonorPaymentRequest initialEntries={entries} />
        </div>
    )
}
