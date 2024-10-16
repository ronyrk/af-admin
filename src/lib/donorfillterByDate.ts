interface User {
  id: string;
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
  paymentDate: string; // ISO format date
}

export const filterUsers = (users: User[],dates:number) => {
  const today = new Date();
  
  // Calculate 30 days from today
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + dates);

  const upcoming: User[] = [];
  const later: User[] = [];

  users.forEach((user) => {
    const paymentDate = new Date(user.paymentDate);

    // Check if the payment date is within 1 to 30 days
    if (paymentDate > today && paymentDate <= next30Days) {
      upcoming.push(user);
    } else if (paymentDate > next30Days) {
      later.push(user);
    }
  });

  return { upcoming, later };
};

