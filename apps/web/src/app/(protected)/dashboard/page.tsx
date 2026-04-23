import { auth } from "@valora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { ExpenseTrendChart } from "@/features/dashboard/components/expense-trend-chart";
import { IncomeExpenseChart } from "@/features/dashboard/components/income-expense-chart";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { PeopleOwing } from "@/features/dashboard/components/people-owing";
import { ReceivablesSummary } from "@/features/dashboard/components/receivables-summary";
import { UpcomingBills } from "@/features/dashboard/components/upcoming-bills";
import { WeeklyExpenseChart } from "@/features/dashboard/components/weekly-expense-chart";
import { getDashboardData } from "@/features/dashboard/data/dashboard.repo";

type DashboardSearchParams = {
  month?: string | string[];
  year?: string | string[];
};

function parseSelectedDate(searchParams?: DashboardSearchParams): Date {
  const monthRaw = Array.isArray(searchParams?.month) ? searchParams?.month[0] : searchParams?.month;
  const yearRaw = Array.isArray(searchParams?.year) ? searchParams?.year[0] : searchParams?.year;

  const now = new Date();
  const parsedMonth = Number(monthRaw);
  const parsedYear = Number(yearRaw);

  const month = Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : now.getMonth() + 1;
  const year = Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100 ? parsedYear : now.getFullYear();

  return new Date(year, month - 1, 1);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const selectedDate = parseSelectedDate(resolvedSearchParams);

  const data = await getDashboardData(session.user.id, session.user.name ?? "", selectedDate);
  const totalTracked = data.monthExpense + data.monthIncome;
  const owingPeopleCount = data.owingPeople.length;
  const owingEntriesCount = data.owingPeople.reduce((sum, person) => sum + person.debtCount, 0);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8 p-6 lg:p-10">
      <DashboardHeader
        userName={data.userName}
        selectedMonth={selectedDate.getMonth() + 1}
        selectedYear={selectedDate.getFullYear()}
        totalTracked={totalTracked}
      />
      <KpiGrid data={data} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <IncomeExpenseChart data={data.dailyFlow} periodDate={selectedDate} />
        </div>
        <div className="xl:col-span-4">
          <div className="grid grid-cols-1 gap-6">
            <UpcomingBills bills={data.upcomingBills} />
            <PeopleOwing people={data.owingPeople} />
            <ReceivablesSummary
              totalReceivable={data.totalReceivable}
              projectedBalance={data.projectedBalance}
              peopleCount={owingPeopleCount}
              entriesCount={owingEntriesCount}
            />
          </div>
        </div>
        <div className="xl:col-span-7">
          <ExpenseTrendChart data={data.dailyFlow} periodDate={selectedDate} />
        </div>
        <div className="xl:col-span-5">
          <WeeklyExpenseChart data={data.dailyFlow} periodDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}
