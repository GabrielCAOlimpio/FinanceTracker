import type { SupabaseClient } from "@supabase/supabase-js"
import type { Income, IncomeInput } from "@/types/income"

export type IncomeFilters = {
  category?: string
  from?: string
  to?: string
}

export async function listIncomes(
  client: SupabaseClient,
  filters: IncomeFilters = {}
): Promise<Income[]> {
  let q = client
    .from("incomes")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters.category) q = q.eq("category", filters.category)
  if (filters.from) q = q.gte("date", filters.from)
  if (filters.to) q = q.lte("date", filters.to)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Income[]
}

export async function createIncome(
  client: SupabaseClient,
  userId: string,
  input: IncomeInput
): Promise<Income> {
  const { data, error } = await client
    .from("incomes")
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as Income
}

export async function updateIncome(
  client: SupabaseClient,
  id: string,
  userId: string,
  patch: Partial<IncomeInput>
): Promise<Income> {
  const { data: existing, error: fetchError } = await client
    .from("incomes")
    .select("user_id")
    .eq("id", id)
    .single()

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      throw new Error("Income not found")
    }
    throw fetchError
  }

  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await client
    .from("incomes")
    .update(patch)
    .eq("id", id)
    .select()
    .single()
    
  if (error) throw error
  return data as Income
}

export async function deleteIncome(
  client: SupabaseClient,
  id: string,
  userId: string
): Promise<void> {
  const { data: existing, error: fetchError } = await client
    .from("incomes")
    .select("user_id")
    .eq("id", id)
    .single()

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      throw new Error("Income not found")
    }
    throw fetchError
  }

  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized")
  }

  const { error } = await client
    .from("incomes")
    .delete()
    .eq("id", id)
    
  if (error) throw error
}
