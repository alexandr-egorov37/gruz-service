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
    if (!isQuickModalOpen) {
      document.body.classList.remove("modal-open")
      return
    }
    document.body.classList.add("modal-open")
    return () => {
      document.body.classList.remove("modal-open")
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
      const { sendToTelegram } = await import("@/lib/telegram")
      const phoneValue = phone.trim()
      const nameValue = name.trim()

      let message = ""
      
      if (openSource === "calculator") {
        try {
          const raw = localStorage.getItem("calculatorState")
          if (!raw) throw new Error("Нет данных калькулятора")
          const p = JSON.parse(raw)
          message = `
<b>🧮 Заявка из калькулятора!</b>
<b>Имя:</b> ${nameValue || "-"}
<b>Телефон:</b> ${phoneValue}
<b>Работа:</b> ${p.workType}
<b>Грузчики:</b> ${p.workers}
<b>Часы:</b> ${p.hours}
<b>Дата:</b> ${p.date}
<b>Время:</b> ${p.time?.hour}:${p.time?.minute}
<b>За городом:</b> ${p.outsideCity ? "Да" : "Нет"}
`
        } catch {
          message = `
<b>⚡️ Быстрая заявка (Ошибка калькулятора)!</b>
<b>Имя:</b> ${nameValue}
<b>Телефон:</b> ${phoneValue}
<b>Дата:</b> ${date}
`
        }
      } else {
        message = `
<b>⚡️ Быстрая заявка!</b>
<b>Имя:</b> ${nameValue}
<b>Телефон:</b> ${phoneValue}
<b>Дата:</b> ${date}
`
      }

      const res = await sendToTelegram(message)
      if (res && res.success === false) {
        throw new Error(res.error || "Ошибка отправки в Telegram")
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

  return (
    <QuickModalContext.Provider value={ctxValue}>
      {children}

      {isQuickModalOpen ? (
        <div
          className="fixed inset-0 z-[2050] flex overflow-y-auto items-end md:items-center justify-center bg-black/70 p-4"
          style={{ WebkitOverflowScrolling: "touch" }}
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
