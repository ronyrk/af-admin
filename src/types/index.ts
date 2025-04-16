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
	hometown: string,
	status: string,
	socailMedia2: string,
	socailMedia1: string,
	mobile: string,
};
export interface IncomeIProps {
	id?: string,
	date: Date,
	amount: string,
	transaction: string,
	type: string,
};
export interface ExpensesIProps {
	id?: string,
	date?: any,
	amount: string,
	description: string
}
export interface DonorIUpdatedProps {
	id?: string,
	password: string,
	name: string,
	photoUrl: string,
	about: string,
	lives: string,
	hometown: string,
	status: string,
	socailMedia2: string,
	socailMedia1: string,
	mobile: string,
};
export interface BranchIUpdatedProps {
	id?: string,
	district: string,
	ps: string,
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
	status?: string,
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
	status?: string,
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
	disbursed?: string,
	recovered?: string,
	balance: string,
	form1: string,
	form2: string,
	nidfont: string,
	nidback: string,
	occupation: string,
	phone: string,
	photosUrl: string,
	status?: string,
};
export interface LoanIUpdatedProps {
	id?: string,
	name: string,
	address: string,
	about?: string,
	disbursed?: string,
	recovered?: string,
	form1: string,
	form2: string,
	nidfont: string,
	nidback: string,
	occupation: string,
	phone: string,
	photosUrl: string,
	status?: string,
};

export interface PaymentIProps {
	id?: string,
	loanusername: string,
	loanAmount: string,
	amount: string,
	createAt: Date
};
export interface PaymentApproveIProps {
	id: string,
	loanusername: string,
	photoUrl: string,
	amount: string,
	method: string,
	createAt: Date
};
export interface DonorPaymentIProps {
	id?: string,
	donorUsername: string,
	loanPayment?: string,
	amount?: string,
	createAt: Date,
	type: string,
	returnDate?: Date,
	donate?: string,
	status: string,
};
export interface DonorPaymentIPropsSend {
	id?: string,
	donorUsername: string,
	loanPayment?: string,
	amount?: string,
	createAt: Date,
	type: string,
	returnDate?: Date,
	donate?: string,
	status: string,
};
export interface FaqIProps {
	id?: string,
	title: string,
	description: string,
}
export interface FaqProps {
	id: string,
	title: string,
	description: string,
}

export interface ProjectsIProps {
	id?: string,
	author: string,
	title: string,
	photoUrl: string,
	shortDes: string,
	description: string,
	createAt?: Date,
	username: string,
	paymentInfo: string,
	link: string,
	outsidePaymentInfo: string,
}
export interface ProjectsIUpdatedProps {
	id?: string,
	title: string,
	photoUrl: string,
	shortDes: string,
	description: string,
	createAt?: Date,
	paymentInfo: string,
	link: string,
	outsidePaymentInfo: string,
}
export interface ProjectsProps {
	id: string,
	author: string,
	title: string,
	photoUrl: string,
	shortDes: string,
	description: string,
	createAt: Date,
	username: string,
	paymentInfo: string,
	link: string,
	outsidePaymentInfo: string,
}
export interface NewsProps {
	id: string,
	title: string,
	photoUrl: string,
	description: string,
	createAt: Date,
	username: string,
	shortDes: string,
}
export interface NewsIProps {
	id?: string,
	title: string,
	photoUrl: string,
	description: string,
	createAt?: Date,
	username: string,
	shortDes: string,
}
export interface NewsIUpdatedProps {
	id?: string,
	title: string,
	photoUrl: string,
	description: string,
	createAt?: Date,
	shortDes: string,
}
export interface ProjectDonateRequestProps {
	id?: string,
	projectName: string,
	name: string,
	email: string,
	amount: string,
	method?: string,
	photoUrl?: string,
	about?: string,
	sendNumber?: string,
	transaction?: string,
	type: string,
	createAt?: Date,
}
export interface DonateProps {
	id?: string,
	projectName: string,
	name: string,
	email: string,
	amount: string,
	method?: string,
	photoUrl?: string,
	about?: string,
	sendNumber?: string,
	transaction?: string,
	type: string,
	createAt: Date,
}
export interface SponsorProps {
	id: string,
	name: string,
	username: string,
	email: string,
	amount: string,
	method?: string,
	photoUrl?: string,
	about?: string,
	createAt: Date,
}
export interface ChildDonateRequestProps {
	id?: string,
	childName: string,
	name: string,
	email: string,
	amount: string,
	method?: string,
	photoUrl?: string,
	about?: string,
	sendNumber?: string,
	transaction?: string,
	type: string,
	createAt?: Date,
}
export interface ChildIProps {
	id?: string,
	name: string,
	username: string,
	description: string,
	photoUrl: string,
	dream: string,
	phone: string,
	address: string,
	academy: string,
	paymentInfo: string,
	link: string,
	outsidePaymentInfo: string,
	shortDes: string,

}
export interface ChildIUpdatedProps {
	id?: string,
	name: string,
	description: string,
	photoUrl: string,
	dream: string,
	phone: string,
	address: string,
	academy: string,
	paymentInfo: string,
	link: string,
	outsidePaymentInfo: string,
	shortDes: string,
}
export interface DisbursementIProps {
	id?: string,
	date: Date,
	description: string,
	username: string,
	amount: string,
}
export interface GalleryIProps {
	id?: string,
	category: string,
	content: string,
}
export interface GalleryProps {
	id?: string,
	category: string,
	content: any,
}
export interface CategoryIProps {
	id?: string,
	name: string,
	path: string,
}
export interface MemberIProps {
	id?: string,
	branch: string,
	teamMemberName: string,
	teamMemberPhone: string,
	teamMemberAddress: string,
	teamMemberOccupation: string,
	teamMemberPhotoUrl: string,
}
export interface SearchIProps {
	start?: any,
	end?: any,
	date?: any,
	transaction?: string,
	page?: string,
};

export interface AllLinkIProps {
	id?: string,
	name: string,
	path: string,
	type: string,
}
export interface OwnerIProps {
	id?: string,
	type: string,
	name: string,
	position: string,
	photos: string,
	facebook: string,
	linkedin: string,
	mobile: string,
	description: string,
}
export interface OwnerUpdateIProps {
	id: string,
	type: string,
	name: string,
	position: string,
	photos: string,
	facebook: string,
	linkedin: string,
	mobile: string,
	description: string,
}
export interface DonorRequestIProps {
	id: string
	name: string
	phone: string
	amount: string
	method: string
	photoUrl: string
	about: string
	lives: string
	hometown: string
	return_date: string
	createAt: string
	invoice?: string
	transactionId?: string
	sendNumber?: string
}
export interface DonorPaymentRequestIProps {
	id: string
	username: string
	amount: string
	method: string
	return_date: string
	createAt: string
	invoice?: string
	transactionId?: string
	sendNumber?: string
}