interface DonorPaymentIProps {
  id?: string;
  donorUsername: string;
  loanPayment?: string;
  amount?: string;
  createAt: Date;
  type: string;
  returnDate?: Date;
  upComing: boolean;
}

export const filterAndSortDonors = (
  donors: DonorPaymentIProps[],
  days: number,
  withinRange: boolean
): DonorPaymentIProps[] => {
  if (!donors?.length) return [];

  const todayMs = Date.now();
  const msPerDay = 864_00_000; // 1000 * 60 * 60 * 24
  const rangeMs = days * msPerDay;

  // Single pass: compute diff once per item, filter + collect in one loop
  const result: Array<{ donor: DonorPaymentIProps; diffMs: number }> = [];

  for (const donor of donors) {
    if (!donor.upComing || !donor.returnDate) continue;

    const diffMs = new Date(donor.returnDate).getTime() - todayMs;

    const passes = withinRange
      ? diffMs >= 0 && diffMs <= rangeMs
      : diffMs > rangeMs;

    if (passes) {
      result.push({ donor, diffMs });
    }
  }

  // Sort ascending by proximity
  result.sort((a, b) => a.diffMs - b.diffMs);

  // Return only the donor objects
  return result.map((r) => r.donor);
};