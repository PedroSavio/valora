export type Money = number;

export type KpiDelta = {
	direction: "up" | "down" | "flat";
	percent: number;
};

export type DailyFlow = {
	day: number;
	income: Money;
	expense: Money;
};

export type UpcomingBill = {
	id: string;
	title: string;
	amount: Money;
	dueDate: string;
	category: string;
};

export type OwingPerson = {
	personId: string | null;
	name: string;
	amount: Money;
	debtCount: number;
};

export type DashboardData = {
	userName: string;
	balance: Money;
	projectedBalance: Money;
	totalDebt: Money;
	totalReceivable: Money;
	monthExpense: Money;
	monthIncome: Money;
	monthTaxDue: Money;
	deltas: {
		balance: KpiDelta;
		debt: KpiDelta;
		expense: KpiDelta;
		income: KpiDelta;
	};
	upcomingBills: UpcomingBill[];
	owingPeople: OwingPerson[];
	dailyFlow: DailyFlow[];
};
