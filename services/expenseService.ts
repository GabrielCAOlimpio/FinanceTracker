import type { SupabaseClient } from "@supabase/supabase-js"
import type { Expense, ExpenseInput } from "@/types/expense"

export type ExpenseFilters = {
  category?: string
  from?: string
  to?: string
}

export async function listExpenses(
  client: SupabaseClient,
  filters: ExpenseFilters = {}
): Promise<Expense[]> {
  let q = client
    .from("expenses")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters.category) q = q.eq("category", filters.category)
  if (filters.from) q = q.gte("date", filters.from)
  if (filters.to) q = q.lte("date", filters.to)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Expense[]
}

export async function createExpense(
  client: SupabaseClient,
  userId: string,
  input: ExpenseInput
): Promise<Expense> {
  const { data, error } = await client
    .from("expenses")
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as Expense
}

export async function updateExpense(
  client: SupabaseClient,
  id: string,
  userId: string,
  patch: Partial<ExpenseInput>
): Promise<Expense> {
  const { data: existing, error: fetchError } = await client
    .from("expenses")
    .select("user_id")
    .eq("id", id)
    .single()

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      throw new Error("Expense not found")
    }
    throw fetchError
  }

  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await client
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select()
    .single()
    
  if (error) throw error
  return data as Expense
}

export async function deleteExpense(
  client: SupabaseClient,
  id: string,
  userId: string
): Promise<void> {
  const { data: existing, error: fetchError } = await client
    .from("expenses")
    .select("user_id")
    .eq("id", id)
    .single()

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      throw new Error("Expense not found")
    }
    throw fetchError
  }

  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized")
  }

  const { error } = await client
    .from("expenses")
    .delete()
    .eq("id", id)
    
  if (error) throw error
}
