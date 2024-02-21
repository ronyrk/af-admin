export interface DonorIProps {
	id?: string,
	username: string,
	email: string,
	code: string,
	password: string,
	name: string,
	photoUrl: string,
	about: string,
	amount: string,
	lives: string,
	hometown: string
	status: string
};

export interface BranchIProps {
	id?: string,
	code: string,
	district: string,
	ps: string,
	username: string,
	email: string,
	branchName: string,
	password: string,
	address: string,
	photoUrl: string[],
	teamLeaderName: string,
	teamLeaderPhone: string,
	teamLeaderAddress: string,
	teamLeaderOccupation: string,
	teamLeaderPhotoUrl: string,
	presidentName: string,
	presidentAddress: string,
	presidentPhone: string,
	presidentOccupation: string
	ImamName: string,
	ImamAddress: string,
	ImamPhone: string,
	ImamOccupation: string,
	SecretaryName: string,
	SecretaryAddress: string,
	SecretaryPhone: string,
	SecretaryOccupation: string,
	status: string,
};
export interface UserNameIProps {
	username: string,
};
export interface ParamsIProps {
	params: UserNameIProps,
};

export interface IdProps {
	id: string,
};
export interface ParamsIdIProps {
	params: IdProps
};

export interface LoginIProps {
	email: string,
	password: string,
};

export interface LoanIProps {
	id?: string,
	username: string,
	name: string,
	code: string,
	branch: string,
	address: string,
	about?: string,
	disbursed: string,
	recovered: string,
	balance: string,
	form1: string,
	form2: string,
	nidfont: string,
	nidback: string,
	occupation: string,
	phone: string,
	photosUrl: string,
	status: string,
};

export interface PaymentIProps {
	id?: string,
	loanusername: string,
	photoUrl: string,
	amount: string,
	method: string,
	createAt?: Date
};
export interface DonorPaymentIProps {
	id?: string,
	donorUsername: string,
	loanPayment: string,
	amount: string,
	createAt?: Date,
	type: string,
};
