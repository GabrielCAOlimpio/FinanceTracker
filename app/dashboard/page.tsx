import { DashboardHeader } from "@/components/dashboard/header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { MonthlySummary } from "@/components/dashboard/monthly-summary"
import { AddTransactionFab } from "@/components/dashboard/add-transaction-fab"
import { Greeting } from "@/components/dashboard/greeting"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "usuário"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">

        <Greeting name={name} />

        <div className="flex flex-col gap-8">
          <SummaryCards />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transações
              </h2>
              <TransactionList />
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Distribuição
                </h2>
                <ExpenseChart />
              </div>
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Resumo
                </h2>
                <MonthlySummary />
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddTransactionFab />
    </div>
  )
}