interface DonorPaymentIProps {
  id?: string,
  donorUsername: string,
  loanPayment?: string,
  amount?: string,
  createAt: Date,
  type: string,
  returnDate?: Date,
  upComing: boolean,
};


export const filterAndSortDonors = (donors: DonorPaymentIProps[], days: number, withinRange: boolean) => {
  const today = new Date();
  console.log({ donors })

  return donors
    .filter((donor: DonorPaymentIProps) => {
      const paymentDate = new Date(donor.returnDate as Date);
      const diffDays = (paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return donor.upComing === true && withinRange ? diffDays >= 0 && diffDays <= days : diffDays > days;
    })
    .sort((a: DonorPaymentIProps, b: DonorPaymentIProps) => {
      const diffA = new Date(a.returnDate as Date).getTime() - today.getTime();
      const diffB = new Date(b.returnDate as Date).getTime() - today.getTime();
      return diffA - diffB; // Sort by difference low to high
    });
};