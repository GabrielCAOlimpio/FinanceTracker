"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Plus, TrendingUp, TrendingDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddTransactionFab() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function navigate(type: "income" | "expense") {
    router.push(`/transactions/new?type=${type}`)
    setOpen(false)
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5",
          "h-14 w-14 rounded-full sm:h-auto sm:w-auto sm:rounded-2xl sm:px-5 sm:py-3",
          "bg-accent text-accent-foreground shadow-2xl shadow-accent/30",
          "transition-shadow hover:shadow-accent/40"
        )}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="h-6 w-6" />
        </motion.div>
        <span className="sr-only sm:not-sr-only text-sm font-bold tracking-tight">
          Adicionar
        </span>
      </motion.button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-none bg-card/80 backdrop-blur-xl shadow-2xl sm:max-w-sm p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Nova Transação</DialogTitle>
          </VisuallyHidden>

          {/* Linha brilho topo */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-base font-black tracking-tight">Nova Transação</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                O que você quer registrar?
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 px-6 pb-6">
            {/* Receita */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("income")}
              className="group flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-success/10 p-5 text-center ring-1 ring-success/20 transition-all hover:bg-success/20 hover:ring-success/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/20 text-success transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-success">Receita</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                  Salário, Freelance, Investimentos
                </p>
              </div>
            </motion.button>

            {/* Despesa */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("expense")}
              className="group flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-destructive/10 p-5 text-center ring-1 ring-destructive/20 transition-all hover:bg-destructive/20 hover:ring-destructive/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/20 text-destructive transition-transform group-hover:scale-110">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-destructive">Despesa</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                  Alimentação, Transporte, Lazer
                </p>
              </div>
            </motion.button>
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}