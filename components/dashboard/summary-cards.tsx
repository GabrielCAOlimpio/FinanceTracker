"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  title: string
  value: string
  variant?: "default" | "income" | "expense"
  loading?: boolean
  trend?: string
}

function SummaryCard({
  title,
  value,
  variant = "default",
  loading,
  trend,
}: SummaryCardProps) {
  const type = variant === "default" ? "balance" : variant

  const isPositive =
    type === "income" || (type === "balance" && !trend?.includes("-"))

  const icons = {
    balance: <Wallet className="h-6 w-6" />,
    income: <TrendingUp className="h-6 w-6" />,
    expense: <TrendingDown className="h-6 w-6" />,
  }

  const variants = {
    balance: "from-primary/10 via-transparent to-transparent border-primary/20",
    income: "from-success/20 via-transparent to-transparent border-success/20",
    expense:
      "from-destructive/20 via-transparent to-transparent border-destructive/20",
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border bg-card/40 backdrop-blur-md transition-shadow hover:shadow-2xl hover:shadow-primary/5",
          "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br",
          variants[type]
        )}
      >
        {/* brilho topo */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={cn(
                "p-3 rounded-2xl shadow-inner",
                type === "balance" && "bg-primary/10 text-primary",
                type === "income" && "bg-success/10 text-success",
                type === "expense" && "bg-destructive/10 text-destructive"
              )}
            >
              {icons[type]}
            </div>

            {trend && !loading && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                  isPositive
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trend}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </p>

            <h2
              className={cn(
                "text-3xl font-black tracking-tight",
                loading &&
                  "animate-pulse bg-muted rounded-lg text-transparent w-40"
              )}
            >
              {value}
            </h2>
          </div>
        </div>

        {/* ícone decorativo */}
        <div className="absolute -bottom-6 -right-6 opacity-[0.03] text-foreground rotate-12">
          {icons[type]}
        </div>
      </Card>
    </motion.div>
  )
}

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

export function SummaryCards() {
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { from, to } = getCurrentMonthRange()

    Promise.all([
      fetch(`/api/incomes?from=${from}&to=${to}`).then((r) => r.json()),
      fetch(`/api/expenses?from=${from}&to=${to}`).then((r) => r.json()),
    ])
      .then(([incJson, expJson]) => {
        const inc = (incJson.data ?? []).reduce(
          (s: number, t: { amount: number }) => s + t.amount,
          0
        )
        const exp = (expJson.data ?? []).reduce(
          (s: number, t: { amount: number }) => s + t.amount,
          0
        )

        setTotalIncome(inc)
        setTotalExpense(exp)
      })
      .finally(() => setLoading(false))
  }, [])

  const balance = totalIncome - totalExpense

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        title="Saldo Disponível"
        value={formatCurrency(balance)}
        loading={loading}
      />
      <SummaryCard
        title="Entradas Mensais"
        value={formatCurrency(totalIncome)}
        variant="income"
        loading={loading}
      />
      <SummaryCard
        title="Saídas Mensais"
        value={formatCurrency(totalExpense)}
        variant="expense"
        loading={loading}
      />
    </div>
  )
}