interface Donation {
    id: string;
    donorUsername: string;
    amount: string;
    loanPayment: string;
    type: string;
    paymentDate: string;
    createAt: string;
}


export function filterAndSortDonations(donations: Donation[]): Donation[] {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    // Filter donations within the date range and exclude entries where amount === loanPayment
    const withinDateRange = donations.filter((donation) => {
        const paymentDate = new Date(donation.paymentDate);
        const amount = Number(donation.amount);
        const loanPayment = Number(donation.loanPayment);

        return (
            paymentDate >= today &&
            paymentDate <= next30Days &&
            amount !== loanPayment
        );
    });

    // Sort by paymentDate in ascending order
    withinDateRange.sort((a, b) => {
        const dateA = new Date(a.paymentDate).getTime();
        const dateB = new Date(b.paymentDate).getTime();
        return dateA - dateB;
    });


    return withinDateRange;
}
