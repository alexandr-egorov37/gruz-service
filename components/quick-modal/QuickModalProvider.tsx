"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

type QuickModalContextValue = {
  openQuickModal: (source?: "default" | "calculator") => void
}

const QuickModalContext = createContext<QuickModalContextValue | null>(null)

export function useQuickModal() {
  const ctx = useContext(QuickModalContext)
  if (!ctx) throw new Error("useQuickModal must be used within QuickModalProvider")
  return ctx
}

export function QuickModalProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [openSource, setOpenSource] = useState<"default" | "calculator">("default")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const date = useMemo(() => new Date().toLocaleDateString("ru-RU"), [])

  const openQuickModal = (source: "default" | "calculator" = "default") => {
    setIsQuickModalOpen(true)
    setOpenSource(source)
    setError(null)
  }

  useEffect(() => {
    if (!isQuickModalOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow || "auto"
    }
  }, [isQuickModalOpen])

  useEffect(() => {
    if (!successToast) return
    const t = window.setTimeout(() => setSuccessToast(null), 4500)
    return () => window.clearTimeout(t)
  }, [successToast])

  const ctxValue = useMemo(
    () => ({
      openQuickModal,
    }),
    []
  )

  async function submitQuickOrder() {
    setSubmitting(true)
    setError(null)
    try {
      const phoneValue = phone.trim()
      const nameValue = name.trim()

      const payload =
        openSource === "calculator"
          ? (() => {
              try {
                const raw = localStorage.getItem("calculatorState")
                if (!raw) return null
                const parsed = JSON.parse(raw) as Record<string, unknown>
                const workType = parsed.workType
                const workers = parsed.workers
                const hours = parsed.hours
                const dateValue = parsed.date
                const outsideCity = parsed.outsideCity
                const time = parsed.time as
                  | { hour?: unknown; minute?: unknown }
                  | undefined

                const valid =
                  typeof workType === "string" &&
                  typeof workers === "number" &&
                  typeof hours === "number" &&
                  typeof dateValue === "string" &&
                  typeof outsideCity === "boolean" &&
                  time &&
                  typeof time.hour === "string" &&
                  typeof time.minute === "string"

                if (!valid) return null

                return {
                  workType,
                  workers,
                  hours,
                  date: dateValue,
                  time: { hour: time.hour, minute: time.minute },
                  outsideCity,
                  phone: phoneValue,
                }
              } catch {
                return null
              }
            })()
          : { name: nameValue, phone: phoneValue, date }

      if (!payload) {
        // Fallback: if calculator state is missing/broken, send quick payload.
        // This keeps the UX functional and avoids "no message" scenarios.
        return submitQuickOrderFallback(phoneValue, nameValue, date)
      }

      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.error || "Не удалось отправить заявку")
      }

      setIsQuickModalOpen(false)
      setName("")
      setPhone("")
      setOpenSource("default")
      setSuccessToast("Заявка отправлена")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки")
    } finally {
      setSubmitting(false)
    }
  }

  async function submitQuickOrderFallback(
    phoneValue: string,
    nameValue: string,
    dateValue: string
  ) {
    const res = await fetch("/api/send-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameValue, phone: phoneValue, date: dateValue }),
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(json?.error || "Не удалось отправить заявку")
    }

    setIsQuickModalOpen(false)
    setName("")
    setPhone("")
    setOpenSource("default")
    setSuccessToast("Заявка отправлена")
  }

  return (
    <QuickModalContext.Provider value={ctxValue}>
      {children}

      {isQuickModalOpen ? (
        <div
          className="fixed inset-0 z-[2050] flex items-end md:items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsQuickModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl md:rounded-2xl bg-[#1f1f1f] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Быстрая заявка
                </h3>
                <p className="text-sm text-muted-foreground">
                  Перезвоним в течение 5 минут
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickModalOpen(false)}
                className="rounded-lg p-2 text-foreground/80 transition hover:bg-white/5 hover:text-foreground"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {/* inputs */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="mt-4 w-full rounded-xl bg-black/40 p-4 text-base text-foreground placeholder:text-foreground/50 outline-none"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              inputMode="tel"
              type="tel"
              className="mt-3 w-full rounded-xl bg-black/40 p-4 text-base text-foreground placeholder:text-foreground/50 outline-none"
            />

            {error ? (
              <div className="mt-3 text-sm font-semibold text-red-400">
                {error}
              </div>
            ) : null}

            {/* button */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setError("Введите имя")
                  return
                }
                if (!phone.trim()) {
                  setError("Введите телефон")
                  return
                }
                submitQuickOrder()
              }}
              disabled={submitting}
              className="
                mt-4 w-full rounded-xl bg-primary py-4 text-base font-bold text-black
                transition-transform duration-300 hover:scale-105 hover:shadow-xl
                disabled:opacity-70
              "
            >
              {submitting ? "Отправляем..." : "Отправить заявку"}
            </button>
          </div>
        </div>
      ) : null}

      {successToast ? (
        <div className="fixed left-1/2 top-4 z-[2060] -translate-x-1/2 rounded-xl bg-[#fbbf24] px-5 py-3 text-base font-bold text-black shadow-xl">
          {successToast}
        </div>
      ) : null}
    </QuickModalContext.Provider>
  )
}

