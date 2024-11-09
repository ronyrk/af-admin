interface Donor {
  id?: string;
  username: string;
  email: string;
  code: string;
  password: string;
  name: string;
  photoUrl: string;
  about: string;
  amount: string;
  lives: string;
  hometown: string;
  status: string;
  paymentDate: Date; // ISO format date
}


export const filterAndSortDonors = (donors: Donor[], days: number, withinRange: boolean) => {
  const today = new Date();

  return donors
    .filter((donor: Donor) => {
      const paymentDate = new Date(donor.paymentDate);
      const diffDays = (paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return withinRange ? diffDays >= 0 && diffDays <= days : diffDays > days;
    })
    .sort((a: Donor, b: Donor) => {
      const diffA = new Date(a.paymentDate).getTime() - today.getTime();
      const diffB = new Date(b.paymentDate).getTime() - today.getTime();
      return diffA - diffB; // Sort by difference low to high
    });
};