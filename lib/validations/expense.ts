import { z } from "zod"
import { EXPENSE_CATEGORIES } from "@/lib/categories"

const categoryEnum = z.enum(EXPENSE_CATEGORIES)

export const expenseBodySchema = z.object({
  description: z.string().trim().min(1).max(200),
  amount: z.number().positive(),
  category: categoryEnum,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const expenseUpdateSchema = expenseBodySchema.partial()