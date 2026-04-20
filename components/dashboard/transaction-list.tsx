"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart, Home, Car, Utensils, Briefcase, Gift,
  Heart, Plane, TrendingUp, SearchX, Loader2
} from "lucide-react"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useTransactions } from "@/hooks/use-transactions"
import { CATEGORY_LABELS } from "@/lib/categories"

type FilterType = "all" | "income" | "expense"

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  alimentacao: Utensils,
  transporte: Car,
  moradia: Home,
  lazer: Plane,
  saude: Heart,
  educacao: Briefcase,
  shopping: ShoppingCart,
  outros: Gift,
  salario: Briefcase,
  freelance: TrendingUp,
  investimentos: TrendingUp,
  presente: Gift,
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value))
}

// ✅ corrigido com "as const"
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

export function TransactionList() {
  const [filter, setFilter] = useState<FilterType>("all")
  const { transactions, loading, error, refetch } = useTransactions()

  const filtered = transactions.filter(
    (t) => filter === "all" || t.type === filter
  )

  return (
    <Card className="flex flex-col h-full border-none bg-card/40 backdrop-blur-md shadow-2xl shadow-primary/5 overflow-hidden">
      
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <CardHeader className="pb-2 relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-black tracking-tight">
            Transações Recentes
          </CardTitle>
          
          {/* 🔥 NOVO FILTER (design atualizado) */}
          <div className="flex p-1 rounded-xl bg-muted/30 backdrop-blur-sm border border-foreground/5">
            {(["all", "income", "expense"] as FilterType[]).map((type) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(type)}
                className={cn(
                  "relative h-8 px-4 text-xs font-bold rounded-lg transition-all z-10",
                  filter === type
                    ? "text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {filter === type && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-sm"
                    transition={{
                      type: "spring" as const,
                      stiffness: 300,
                      damping: 25,
                    }}
                  />
                )}

                <span className="relative z-10">
                  {type === "all"
                    ? "Todas"
                    : type === "income"
                    ? "Receitas"
                    : "Despesas"}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 px-2 pb-4 relative z-10">
        {loading ? (
          <div className="flex h-[350px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin opacity-50" />
            <p className="text-sm font-medium">Buscando transações...</p>
          </div>
        ) : error ? (
          <div className="flex h-[350px] flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <SearchX className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={refetch}
              className="rounded-xl font-bold"
            >
              Tentar novamente
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-[350px] flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma transação encontrada
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-1 py-2"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((transaction) => {
                  const Icon =
                    CATEGORY_ICONS[transaction.category] ?? Gift

                  const categoryLabel =
                    CATEGORY_LABELS[
                      transaction.category as keyof typeof CATEGORY_LABELS
                    ] ?? transaction.category

                  return (
                    <motion.div
                      key={transaction.id}
                      layout
                      variants={itemVariants}
                      className="group flex items-center justify-between p-3 rounded-2xl hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex items-center justify-center h-12 w-12 rounded-2xl transition-transform group-hover:scale-105 shadow-inner",
                            transaction.type === "income"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold leading-none">
                            {transaction.description}
                          </span>

                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                            {formatDate(transaction.date)}
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            {categoryLabel}
                          </span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "text-right font-black text-sm",
                          transaction.type === "income"
                            ? "text-success"
                            : "text-foreground"
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}{" "}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </ScrollArea>
        )}
      </div>
    </Card>
  )
}