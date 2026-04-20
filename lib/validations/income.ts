import { z } from "zod"
import { INCOME_CATEGORIES } from "@/lib/categories"

const categoryEnum = z.enum(INCOME_CATEGORIES)

export const incomeBodySchema = z.object({
  description: z.string().trim().min(1).max(200),
  amount: z.number().positive(),
  category: categoryEnum,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const incomeUpdateSchema = incomeBodySchema.partial()