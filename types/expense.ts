import type { ExpenseCategory } from "@/lib/categories"

export interface Expense {
  id: string
  user_id: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  created_at: string
}

export interface ExpenseInput {
  description: string
  amount: number
  category: ExpenseCategory
  date: string
}