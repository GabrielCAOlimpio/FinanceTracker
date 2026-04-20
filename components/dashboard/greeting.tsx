"use client"

import { useEffect, useState } from "react"

function getGreeting(hour: number) {
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

function getMotivation(hour: number) {
  if (hour < 12) return "Comece o dia com suas finanças em ordem. 💪"
  if (hour < 18) return "Como estão seus gastos hoje? Veja o resumo abaixo."
  return "Finalize o dia revisando suas transações. 🌙"
}

interface GreetingProps {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  const [mounted, setMounted] = useState(false)
  const [hour, setHour] = useState(0)

  useEffect(() => {
    setHour(new Date().getHours())
    setMounted(true)
  }, [])

  const monthName = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  if (!mounted) return (
    <div className="mb-10 border-b border-border pb-8">
      <div className="h-4 w-32 animate-pulse rounded bg-muted mb-2" />
      <div className="h-8 w-64 animate-pulse rounded bg-muted mb-2" />
      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
    </div>
  )

  return (
    <div className="mb-10 border-b border-border pb-8">
      <p className="text-sm font-medium text-accent mb-1">
        {getGreeting(hour)}, {name}! 👋
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Suas Finanças em{" "}
        <span className="capitalize text-accent">{monthName}</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {getMotivation(hour)}
      </p>
    </div>
  )
}