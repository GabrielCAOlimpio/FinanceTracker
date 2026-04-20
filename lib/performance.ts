import { cache } from "react"

// Cache para requests de API
export const cachedFetch = cache(async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
})

// Debounce para search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Memoização para cálculos financeiros
export const calculateBalance = cache((incomes: number[], expenses: number[]) => {
  const totalIncome = incomes.reduce((sum, amount) => sum + amount, 0)
  const totalExpense = expenses.reduce((sum, amount) => sum + amount, 0)
  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense
  }
})

// Formatação de moeda otimizada
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatCurrency = (value: number): string => {
  return currencyFormatter.format(Math.abs(value))
}
