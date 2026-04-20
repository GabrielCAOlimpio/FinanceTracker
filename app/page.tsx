import { DashboardHeader } from "@/components/dashboard/header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { MonthlySummary } from "@/components/dashboard/monthly-summary"
import { AddTransactionFab } from "@/components/dashboard/add-transaction-fab"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Olá, João! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui está um resumo das suas finanças este mês.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Summary Cards */}
          <SummaryCards />

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Transaction List - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <TransactionList />
            </div>

            {/* Right Column - Charts and Summary */}
            <div className="flex flex-col gap-8">
              <ExpenseChart />
              <MonthlySummary />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <AddTransactionFab />
    </div>
  )
}
