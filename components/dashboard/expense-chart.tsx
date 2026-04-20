"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/categories"

interface ChartData {
  name: string
  value: number
  percentage: string
}

const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function getCurrentMonthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
  return { from, to }
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
    </g>
  )
}

export function ExpenseChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const { from, to } = getCurrentMonthRange()
    fetch(`/api/expenses?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(json => {
        const expenses: { category: string; amount: number }[] = json.data ?? []
        const grouped: Record<string, number> = {}
        for (const e of expenses) {
          grouped[e.category] = (grouped[e.category] ?? 0) + e.amount
        }
        const total = Object.values(grouped).reduce((s, v) => s + v, 0)
        setData(
          Object.entries(grouped).map(([key, value]) => ({
            name: EXPENSE_CATEGORY_LABELS[key as keyof typeof EXPENSE_CATEGORY_LABELS] ?? key,
            value,
            percentage: total > 0 ? ((value / total) * 100).toFixed(0) : "0",
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const total = data.reduce((s, d) => s + d.value, 0)
  const activeItem = activeIndex !== null ? data[activeIndex] : null

  return (
    <Card className="relative overflow-hidden border-none bg-card/40 shadow-xl shadow-black/10 backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <CardHeader className="pb-2">
        <CardTitle className="text-base font-black tracking-tight">
          Gastos por Categoria
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Sem despesas este mês
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Gráfico */}
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex ?? undefined}
                    activeShape={renderActiveShape}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={88}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centro */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeItem ? (
                    <motion.div
                      key={activeItem.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {activeItem.name}
                      </span>
                      <span className="text-lg font-black tracking-tight text-foreground">
                        {formatCurrency(activeItem.value)}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {activeItem.percentage}%
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="total"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Total
                      </span>
                      <span className="text-lg font-black tracking-tight text-foreground">
                        {formatCurrency(total)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Legenda */}
            <div className="grid grid-cols-2 gap-1.5">
              {data.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={cn(
                    "flex cursor-default items-center gap-2.5 rounded-xl p-2.5 transition-all",
                    activeIndex === index
                      ? "bg-white/5 ring-1 ring-white/10"
                      : "hover:bg-white/5",
                    activeIndex !== null && activeIndex !== index && "opacity-40"
                  )}
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-semibold">{item.name}</span>
                    <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
                      {item.percentage}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}