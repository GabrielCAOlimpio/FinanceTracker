"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingDown, Target, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/categories"
import { cn } from "@/lib/utils"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function getCurrentMonthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]
  return { from, to }
}

interface InsightCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtext: string
  color: string
  delay: number
}

function InsightCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  delay,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="group relative overflow-hidden rounded-3xl bg-muted/30 backdrop-blur-sm border border-white/5 p-5 transition-all hover:bg-muted/50"
    >
      {/* Background icon suave */}
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 opacity-[0.06] transition-transform group-hover:scale-110",
          color
        )}
      >
        <Icon className="h-full w-full" />
      </div>

      {/* Ícone principal */}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl mb-4 shadow-inner",
          color
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Conteúdo */}
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          {label}
        </p>

        <h3 className="text-lg font-black tracking-tight text-foreground leading-none">
          {value}
        </h3>

        <p className="text-xs text-muted-foreground leading-tight">
          {subtext}
        </p>
      </div>
    </motion.div>
  )
}

export function MonthlySummary() {
  const [loading, setLoading] = useState(true)
  const [incomeCount, setIncomeCount] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [topCategory, setTopCategory] = useState("-")
  const [topCategoryCount, setTopCategoryCount] = useState(0)
  const [dailyAvg, setDailyAvg] = useState(0)

  useEffect(() => {
    const { from, to } = getCurrentMonthRange()

    Promise.all([
      fetch(`/api/incomes?from=${from}&to=${to}`).then((r) => r.json()),
      fetch(`/api/expenses?from=${from}&to=${to}`).then((r) => r.json()),
    ])
      .then(([incJson, expJson]) => {
        const incomes = incJson.data ?? []
        const expenses = expJson.data ?? []

        setIncomeCount(incomes.length)
        setExpenseCount(expenses.length)

        // Categoria mais usada
        const grouped: Record<string, number> = {}
        for (const e of expenses) {
          grouped[e.category] = (grouped[e.category] ?? 0) + 1
        }

        const top = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]

        if (top) {
          setTopCategory(
            EXPENSE_CATEGORY_LABELS[
              top[0] as keyof typeof EXPENSE_CATEGORY_LABELS
            ] ?? top[0]
          )
          setTopCategoryCount(top[1])
        }

        // Média diária
        const totalExp = expenses.reduce(
          (s: number, e: { amount: number }) => s + e.amount,
          0
        )

        const daysInMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).getDate()

        setDailyAvg(totalExp / daysInMonth)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalTransactions = incomeCount + expenseCount

  return (
    <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl shadow-primary/5">
      
      {/* Glow topo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <CardHeader className="pb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <CardTitle className="text-lg font-black tracking-tight">
            Insights do Mês
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[150px]">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <InsightCard
              icon={Zap}
              label="Volume"
              value={`${totalTransactions}`}
              subtext={`${incomeCount} entradas • ${expenseCount} saídas`}
              color="bg-violet-500"
              delay={0.1}
            />

            <InsightCard
              icon={Target}
              label="Categoria Top"
              value={topCategory}
              subtext={`${topCategoryCount} transações`}
              color="bg-pink-500"
              delay={0.2}
            />

            <InsightCard
              icon={TrendingDown}
              label="Média Diária"
              value={formatCurrency(dailyAvg)}
              subtext="gastos por dia"
              color="bg-blue-500"
              delay={0.3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}