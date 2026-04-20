import type { IncomeCategory } from "@/lib/categories"

export interface Income {
  id: string
  user_id: string
  description: string
  amount: number
  category: IncomeCategory
  date: string
  created_at: string
}

export interface IncomeInput {
  description: string
  amount: number
  category: IncomeCategory
  date: string
}