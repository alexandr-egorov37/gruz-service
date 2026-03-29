"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Select } from "./Select"
import { DatePicker } from "./DatePicker"
import { TimePicker } from "./TimePicker"
import type { DropdownOption } from "./Dropdown"
import { useQuickModal } from "@/components/quick-modal/QuickModalProvider"

export type CalculatorState = {
  workType: string
  workers: number
  hours: number
  date: string // ISO yyyy-MM-dd
  time: {
    hour: string
    minute: string
  }
  outsideCity: boolean
}

type OpenId =
  | "workType"
  | "workers"
  | "hours"
  | "date"
  | "timeHour"
  | "timeMinute"
  | null

function toIsoDate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, "0")
  const day = `${d.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function Calculator() {
  const todayIso = useMemo(() => toIsoDate(new Date()), [])
  const { openQuickModal } = useQuickModal()
  const textRef = useRef<HTMLDivElement>(null)

  const workTypeOptions: DropdownOption[] = useMemo(
    () => [
      { value: "Грузчики", label: "Грузчики" },
      { value: "Такелажные работы", label: "Такелажные работы" },
      { value: "Разнорабочие", label: "Разнорабочие" },
      { value: "Переезд", label: "Переезд" },
    ],
    []
  )

  const workerOptions: DropdownOption[] = useMemo(() => {
    const out: DropdownOption[] = []
    for (let i = 1; i <= 10; i++) {
      out.push({
        value: `${i}`,
        label: i === 10 ? "10+ чел." : `${i} чел.`,
      })
    }
    return out
  }, [])

  const hourOptions: DropdownOption[] = useMemo(() => {
    const out: DropdownOption[] = []
    for (let i = 1; i <= 10; i++) {
      out.push({
        value: `${i}`,
        label: i === 10 ? "10+ часов" : `${i} час${i === 1 ? "" : "а"}`,
      })
    }
    return out
  }, [])

  const [state, setState] = useState<CalculatorState>({
    workType: "Грузчики",
    workers: 1,
    hours: 1,
    date: todayIso,
    time: { hour: "08", minute: "00" },
    outsideCity: false,
  })

  useEffect(() => {
    // Используется для popup-заявки в hero-секции.
    try {
      localStorage.setItem(
        "calculatorState",
        JSON.stringify({
          workType: state.workType,
          workers: state.workers,
          hours: state.hours,
          date: state.date,
          time: state.time,
          outsideCity: state.outsideCity,
        })
      )
    } catch {
      // localStorage может быть недоступен в некоторых режимах.
    }
  }, [state])

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    const items = el.querySelectorAll(".title, .subtitle")

    items.forEach((item, i) => {
      const element = item as HTMLElement

      element.style.opacity = "0"
      element.style.transform = "translateY(20px)"

      setTimeout(() => {
        element.style.transition = "all 0.6s ease"
        element.style.opacity = "1"
        element.style.transform = "translateY(0)"
      }, i * 200)
    })
  }, [])

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    // Make parallax relative to current position so it doesn't "jump down"
    // when the user already scrolled the page.
    const startScrollY = window.scrollY
    el.style.transform = "translateY(0px)"

    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        const currentEl = textRef.current
        if (!currentEl) return

        const delta = window.scrollY - startScrollY
        const offset = Math.max(Math.min(delta * 0.05, 12), -12)
        currentEl.style.transform = `translateY(${offset}px)`
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [])

  const [openId, setOpenId] = useState<OpenId>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Логика расчета будет добавлена позже. Сейчас проверяем только UI/UX.
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8">
      <div className="mb-8 md:mb-12">
        <div
          ref={textRef}
          className="text-center max-w-3xl mx-auto space-y-3 will-change-transform"
        >
          <h2 className="title text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,180,0,0.35)]">
            Онлайн-калькулятор
          </h2>

          <p className="subtitle text-lg text-gray-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">
            Введите данные для предварительного расчёта стоимости заказа
          </p>

          <p className="subtitle text-lg text-gray-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">
            услуг грузчиков и получите скидку до 10% на первый заказ.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl overflow-visible rounded-3xl border border-border bg-card relative z-10">
        <form onSubmit={onSubmit} className="p-6 lg:p-8 relative z-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Select
                id="workType"
                label="Вид работ"
                value={state.workType}
                options={workTypeOptions}
                placeholder="Выберите вид работ"
                open={openId === "workType"}
                onOpenChange={(open) => setOpenId(open ? "workType" : null)}
                onChange={(v) => setState((s) => ({ ...s, workType: v }))}
              />
            </div>

            <div className="lg:col-span-1">
              <Select
                id="workers"
                label="Количество грузчиков"
                value={`${state.workers}`}
                options={workerOptions}
                placeholder="Выберите грузчиков"
                open={openId === "workers"}
                onOpenChange={(open) => setOpenId(open ? "workers" : null)}
                onChange={(v) =>
                  setState((s) => ({ ...s, workers: Number(v) }))
                }
              />
            </div>

            <div className="lg:col-span-1">
              <Select
                id="hours"
                label="Количество часов"
                value={`${state.hours}`}
                options={hourOptions}
                placeholder="Выберите часы"
                open={openId === "hours"}
                onOpenChange={(open) => setOpenId(open ? "hours" : null)}
                onChange={(v) => setState((s) => ({ ...s, hours: Number(v) }))}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <DatePicker
                id="date"
                label="Дата"
                value={state.date}
                open={openId === "date"}
                onOpenChange={(open) => setOpenId(open ? "date" : null)}
                onChange={(iso) => setState((s) => ({ ...s, date: iso }))}
              />
            </div>

            <div className="lg:col-span-2">
              <TimePicker
                openId={openId}
                setOpenId={(id) => setOpenId(id as OpenId)}
                valueHour={state.time.hour}
                valueMinute={state.time.minute}
                onChange={(next) =>
                  setState((s) => ({
                    ...s,
                    time: { ...next },
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#2b2b2b] border border-white/10 px-4 py-3">
              <input
                type="checkbox"
                checked={state.outsideCity}
                onChange={(e) =>
                  setState((s) => ({ ...s, outsideCity: e.target.checked }))
                }
                className="h-5 w-5 accent-[#fbbf24]"
              />
              <span className="text-base font-semibold text-foreground">
                Работа за городом
              </span>
            </label>

            <button
              type="button"
              className="
                rounded-2xl bg-[#fbbf24] px-7 py-4 text-base font-bold text-black
                transition-transform duration-300 hover:scale-105 hover:shadow-xl
              "
              onClick={() => openQuickModal("calculator")}
            >
              Рассчитать
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

