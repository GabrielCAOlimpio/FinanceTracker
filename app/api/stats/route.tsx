import { NextResponse } from "next/server"
import { getRouteAuth } from "@/lib/auth/api-route"

export async function GET() {
  const auth = await getRouteAuth()
  if ("error" in auth) return auth.error
  const { supabase, user } = auth

  const [{ data: incomes }, { data: expenses }] = await Promise.all([
    supabase.from("incomes").select("amount, date").eq("user_id", user.id),
    supabase.from("expenses").select("amount, date").eq("user_id", user.id),
  ])

  const totalIncome = (incomes ?? []).reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = (expenses ?? []).reduce((s, t) => s + Number(t.amount), 0)
  const totalNet = totalIncome - totalExpense

  // Streak — dias consecutivos com pelo menos 1 transação
  const allDates = [
    ...(incomes ?? []).map((t) => t.date),
    ...(expenses ?? []).map((t) => t.date),
  ]

  const uniqueDays = [...new Set(allDates)].sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < uniqueDays.length; i++) {
    const day = new Date(uniqueDays[i])
    day.setHours(0, 0, 0, 0)
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    if (day.getTime() === expected.getTime()) {
      streak++
    } else {
      break
    }
  }

  return NextResponse.json({ totalIncome, totalExpense, totalNet, streak })
}