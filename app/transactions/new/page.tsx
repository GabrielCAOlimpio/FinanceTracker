"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Heart,
  GraduationCap,
  Briefcase,
  Wallet,
  Gift,
  MoreHorizontal,
  Home,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const incomeCategories = [
  { value: "salario", label: "Salário", icon: Briefcase },
  { value: "freelance", label: "Freelancer", icon: Wallet },
  { value: "investimentos", label: "Investimentos", icon: TrendingUp },
  { value: "presente", label: "Presente", icon: Gift },
  { value: "outros", label: "Outros", icon: MoreHorizontal },
]

const expenseCategories = [
  { value: "alimentacao", label: "Alimentação", icon: Utensils },
  { value: "transporte", label: "Transporte", icon: Car },
  { value: "moradia", label: "Moradia", icon: Home },
  { value: "lazer", label: "Lazer", icon: Film },
  { value: "saude", label: "Saúde", icon: Heart },
  { value: "educacao", label: "Educação", icon: GraduationCap },
  { value: "shopping", label: "Compras", icon: ShoppingBag },
  { value: "outros", label: "Outros", icon: MoreHorizontal },
]

export default function AddTransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") === "income" ? "income" : "expense"

  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: initialType as "income" | "expense",
    category: "",
    date: new Date(),
  })
  const [errors, setErrors] = useState<{
    description?: string
    amount?: string
    category?: string
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }
    if (!formData.amount) {
      newErrors.amount = "Valor é obrigatório"
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valor deve ser maior que zero"
    }
    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const endpoint = formData.type === "income" ? "/api/incomes" : "/api/expenses"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description.trim(),
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date.toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? "Erro ao salvar transação")
      }

      router.push("/dashboard")
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro inesperado. Tente novamente."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeChange = (type: "income" | "expense") => {
    setFormData((prev) => ({ ...prev, type, category: "" }))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Voltar">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Nova Transação</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Adicionar transação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => handleTypeChange("expense")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                    formData.type === "expense"
                      ? "bg-destructive text-destructive-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingDown className="w-4 h-4" />
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("income")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                    formData.type === "income"
                      ? "bg-success text-success-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingUp className="w-4 h-4" />
                  Receita
                </button>
              </div>

              <FieldGroup>
                {/* Description */}
                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">Descrição</FieldLabel>
                  <Input
                    id="description"
                    placeholder="Ex: Almoço no restaurante"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    disabled={isLoading}
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? "description-error" : undefined}
                  />
                  {errors.description && (
                    <FieldError id="description-error">{errors.description}</FieldError>
                  )}
                </Field>

                {/* Amount */}
                <Field data-invalid={!!errors.amount}>
                  <FieldLabel htmlFor="amount">Valor (R$)</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, amount: e.target.value }))
                      }
                      className="pl-10"
                      disabled={isLoading}
                      aria-invalid={!!errors.amount}
                      aria-describedby={errors.amount ? "amount-error" : undefined}
                    />
                  </div>
                  {errors.amount && (
                    <FieldError id="amount-error">{errors.amount}</FieldError>
                  )}
                </Field>

                {/* Category */}
                <Field data-invalid={!!errors.category}>
                  <FieldLabel htmlFor="category">Categoria</FieldLabel>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="category"
                      className="w-full"
                      aria-invalid={!!errors.category}
                      aria-describedby={errors.category ? "category-error" : undefined}
                    >
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.type === "income" ? incomeCategories : expenseCategories).map(
                        (category) => {
                          const IconComponent = category.icon
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          )
                        }
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <FieldError id="category-error">{errors.category}</FieldError>
                  )}
                </Field>

                {/* Date */}
                <Field>
                  <FieldLabel>Data</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date
                          ? format(formData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) =>
                          date && setFormData((prev) => ({ ...prev, date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </FieldGroup>

              {/* Submit error */}
              {submitError && (
                <p className="text-sm text-destructive" role="alert">
                  {submitError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className={cn(
                    "flex-1",
                    formData.type === "income" && "bg-success hover:bg-success/90"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}