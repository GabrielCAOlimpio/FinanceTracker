export const INCOME_CATEGORIES = [
  "salario",
  "freelance",
  "investimentos",
  "presente",
  "outros",
] as const

export const EXPENSE_CATEGORIES = [
  "alimentacao",
  "transporte",
  "moradia",
  "lazer",
  "saude",
  "educacao",
  "shopping",
  "outros",
] as const

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
export type TransactionCategory = IncomeCategory | ExpenseCategory

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  salario: "Salário",
  freelance: "Freelancer",
  investimentos: "Investimentos",
  presente: "Presente",
  outros: "Outros",
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  moradia: "Moradia",
  lazer: "Lazer",
  saude: "Saúde",
  educacao: "Educação",
  shopping: "Compras",
  outros: "Outros",
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  ...INCOME_CATEGORY_LABELS,
  ...EXPENSE_CATEGORY_LABELS,
}

export const TRANSACTION_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
] as const