import { NextResponse } from "next/server"
import { getRouteAuth } from "@/lib/auth/api-route"
import { listIncomes, createIncome } from "@/services/incomeService"
import { incomeBodySchema } from "@/lib/validations/income"

export async function GET(request: Request) {
  const auth = await getRouteAuth()
  if ("error" in auth) return auth.error
  const { supabase } = auth

  const { searchParams } = new URL(request.url)
  try {
    const data = await listIncomes(supabase, {
      category: searchParams.get("category") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    })
    return NextResponse.json({ data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao listar entradas" }, { status: 500 })
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

  const parsed = incomeBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message, details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const row = await createIncome(supabase, user.id, parsed.data)
    return NextResponse.json({ data: row }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao criar entrada" }, { status: 500 })
  }
}
