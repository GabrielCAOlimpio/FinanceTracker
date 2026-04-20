"use client"

import { useState, useEffect, useCallback } from "react"
import { Income } from "@/types/income"
import { Expense } from "@/types/expense"

export type Transaction =
  | (Income & { type: "income" })
  | (Expense & { type: "expense" })

interface TransactionData {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTransactions(): TransactionData {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [incRes, expRes] = await Promise.all([
        fetch("/api/incomes"),
        fetch("/api/expenses"),
      ])

      if (!incRes.ok || !expRes.ok) {
        throw new Error("Falha ao carregar transações")
      }

      const [incData, expData] = await Promise.all([
        incRes.json(),
        expRes.json(),
      ])

      const incomes: Transaction[] = (incData.data ?? []).map((t: Income) => ({
        ...t,
        type: "income" as const,
      }))

      const expenses: Transaction[] = (expData.data ?? []).map((t: Expense) => ({
        ...t,
        type: "expense" as const,
      }))

      const merged = [...incomes, ...expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setTransactions(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { transactions, loading, error, refetch: fetchData }
}