import { NextResponse } from "next/server"
import { getRouteAuth } from "@/lib/auth/api-route"
import { listExpenses, createExpense } from "@/services/expenseService"
import { expenseBodySchema } from "@/lib/validations/expense"

export async function GET(request: Request) {
  const auth = await getRouteAuth()
  if ("error" in auth) return auth.error
  const { supabase } = auth

  const { searchParams } = new URL(request.url)
  try {
    const data = await listExpenses(supabase, {
      category: searchParams.get("category") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    })
    return NextResponse.json({ data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao listar gastos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await getRouteAuth()
  if ("error" in auth) return auth.error
  const { supabase, user } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const parsed = expenseBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const row = await createExpense(supabase, user.id, parsed.data)
    return NextResponse.json({ data: row }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao criar gasto" }, { status: 500 })
  }
}
