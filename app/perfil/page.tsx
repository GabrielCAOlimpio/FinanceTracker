"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import {
  ArrowLeft, Calendar, Flame, TrendingUp, TrendingDown,
  Wallet, Loader2, Pencil, Camera, X, Check,
  Mail, User, KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { getSupabasePublicEnv } from "@/lib/env"
import { cn } from "@/lib/utils"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

interface Stats {
  totalIncome: number
  totalExpense: number
  totalNet: number
  streak: number
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  variant?: "default" | "income" | "expense" | "streak"
}

function StatCard({ icon: Icon, label, value, variant = "default" }: StatCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 rounded-2xl p-5",
      variant === "income" && "bg-success/10",
      variant === "expense" && "bg-destructive/10",
      variant === "streak" && "bg-orange-500/10",
      variant === "default" && "bg-primary/10",
    )}>
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl",
        variant === "income" && "bg-success/20 text-success",
        variant === "expense" && "bg-destructive/20 text-destructive",
        variant === "streak" && "bg-orange-500/20 text-orange-500",
        variant === "default" && "bg-primary/20 text-primary",
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <span className={cn(
        "text-2xl font-extrabold tracking-tight",
        variant === "income" && "text-success",
        variant === "expense" && "text-destructive",
        variant === "streak" && "text-orange-500",
        variant === "default" && "text-primary",
      )}>
        {value}
      </span>
      <span className="text-center text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

type EditField = "name" | "email" | "password" | null

export default function PerfilPage() {
  const router = useRouter()
  const { url, anonKey } = getSupabasePublicEnv()
  const supabase = createBrowserClient(url, anonKey)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // User data
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState("")
  const [userId, setUserId] = useState("")
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Edit state
  const [editField, setEditField] = useState<EditField>(null)
  const [editValue, setEditValue] = useState("")
  const [editConfirm, setEditConfirm] = useState("")
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.push("/login"); return }

      const u = data.user
      setUserId(u.id)
      setEmail(u.email ?? "")
      setName(u.user_metadata?.name ?? "")
      setAvatarUrl(u.user_metadata?.avatar_url ?? null)
      setCreatedAt(
        new Date(u.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit", month: "long", year: "numeric",
        })
      )

      const res = await fetch("/api/stats")
      if (res.ok) setStats(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  // Avatar upload
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem deve ter no máximo 2MB.")
      return
    }

    setUploadingAvatar(true)
    try {
      const ext = file.name.split(".").pop()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path)

      const newUrl = `${publicData.publicUrl}?t=${Date.now()}`

      await supabase.auth.updateUser({
        data: { avatar_url: newUrl },
      })

      setAvatarUrl(newUrl)
    } catch {
      alert("Erro ao enviar foto. Tente novamente.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Open edit
  function openEdit(field: EditField) {
    setEditField(field)
    setEditValue(field === "name" ? name : field === "email" ? email : "")
    setEditConfirm("")
    setEditError(null)
    setEditSuccess(null)
  }

  function closeEdit() {
    setEditField(null)
    setEditValue("")
    setEditConfirm("")
    setEditError(null)
  }

  async function handleSave() {
    setEditError(null)
    setEditSuccess(null)

    if (editField === "name") {
      if (!editValue.trim()) return setEditError("Nome não pode ser vazio.")
      setSaving(true)
      const { error } = await supabase.auth.updateUser({
        data: { name: editValue.trim() },
      })
      setSaving(false)
      if (error) return setEditError("Erro ao salvar nome.")
      setName(editValue.trim())
      setEditSuccess("Nome atualizado!")
      setTimeout(closeEdit, 1200)
    }

    if (editField === "email") {
      if (!editValue.trim()) return setEditError("E-mail não pode ser vazio.")
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValue))
        return setEditError("E-mail inválido.")
      if (editValue === email) return setEditError("É o mesmo e-mail atual.")
      setSaving(true)
      const { error } = await supabase.auth.updateUser({ email: editValue })
      setSaving(false)
      if (error) return setEditError("Erro ao atualizar e-mail.")
      setEditSuccess("Confirme o novo e-mail pela caixa de entrada.")
      setTimeout(closeEdit, 2000)
    }

    if (editField === "password") {
      if (!editValue) return setEditError("Informe a nova senha.")
      if (editValue.length < 6) return setEditError("Mínimo 6 caracteres.")
      if (editValue !== editConfirm) return setEditError("Senhas não coincidem.")
      setSaving(true)
      const { error } = await supabase.auth.updateUser({ password: editValue })
      setSaving(false)
      if (error) return setEditError("Erro ao alterar senha.")
      setEditSuccess("Senha alterada!")
      setTimeout(closeEdit, 1200)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const displayName = name || email.split("@")[0]
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Perfil</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">

        {/* Avatar + info */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-accent shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-accent-foreground">
                  {initials}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md transition hover:scale-105"
            >
              {uploadingAvatar
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Camera className="h-4 w-4" />
              }
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Membro desde {createdAt}</span>
          </div>
        </div>

        {/* Streak */}
        {stats && (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">Ofensiva</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-orange-500/10 py-6">
                <span className="text-6xl font-extrabold text-orange-500">
                  {stats.streak}
                </span>
                <span className="text-sm font-semibold text-orange-500">
                  {stats.streak === 1 ? "dia consecutivo" : "dias consecutivos"}
                </span>
                <span className="mt-1 text-xs text-muted-foreground text-center px-4">
                  {stats.streak === 0
                    ? "Registre uma transação hoje para começar!"
                    : "Continue registrando para não perder sua ofensiva 🔥"}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {stats && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Histórico Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={TrendingUp} label="Total Arrecadado" value={formatCurrency(stats.totalIncome)} variant="income" />
                <StatCard icon={TrendingDown} label="Total Gasto" value={formatCurrency(stats.totalExpense)} variant="expense" />
                <div className="col-span-2">
                  <StatCard
                    icon={Wallet}
                    label="Saldo Líquido Total"
                    value={formatCurrency(stats.totalNet)}
                    variant={stats.totalNet >= 0 ? "default" : "expense"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editar dados */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Dados da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* Nome */}
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{displayName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit("name")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            {editField === "name" && (
              <EditInline
                label="Novo nome"
                value={editValue}
                onChange={setEditValue}
                error={editError}
                success={editSuccess}
                saving={saving}
                onSave={handleSave}
                onCancel={closeEdit}
              />
            )}

            {/* Email */}
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit("email")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            {editField === "email" && (
              <EditInline
                label="Novo e-mail"
                type="email"
                value={editValue}
                onChange={setEditValue}
                error={editError}
                success={editSuccess}
                saving={saving}
                onSave={handleSave}
                onCancel={closeEdit}
              />
            )}

            {/* Senha */}
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Senha</p>
                  <p className="font-medium">••••••••</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit("password")}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            {editField === "password" && (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <Field>
                  <FieldLabel>Nova senha</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Confirmar senha</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={editConfirm}
                    onChange={(e) => setEditConfirm(e.target.value)}
                  />
                </Field>
                {editError && <p className="text-sm text-destructive">{editError}</p>}
                {editSuccess && <p className="text-sm text-success">{editSuccess}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={closeEdit} className="flex-1">
                    <X className="mr-1 h-4 w-4" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1">
                    {saving
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><Check className="mr-1 h-4 w-4" /> Salvar</>
                    }
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

      </main>
    </div>
  )
}

// Componente inline de edição
interface EditInlineProps {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  error: string | null
  success: string | null
  saving: boolean
  onSave: () => void
  onCancel: () => void
}

function EditInline({
  label, type = "text", value, onChange,
  error, success, saving, onSave, onCancel,
}: EditInlineProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
        {error && <FieldError>{error}</FieldError>}
        {success && <p className="text-sm text-success">{success}</p>}
      </Field>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
          <X className="mr-1 h-4 w-4" /> Cancelar
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving} className="flex-1">
          {saving
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <><Check className="mr-1 h-4 w-4" /> Salvar</>
          }
        </Button>
      </div>
    </div>
  )
}