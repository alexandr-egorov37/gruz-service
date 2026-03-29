"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, format } from "date-fns"
import { ru as ruLocale } from "date-fns/locale"

type DatePickerProps = {
  id: string
  label: string
  value: string // ISO yyyy-MM-dd
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (isoDate: string) => void
}

function isoToDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d)
}

function dateToIso(date: Date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DatePicker({
  id,
  label,
  value,
  open,
  onOpenChange,
  onChange,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  const todayIso = useMemo(() => dateToIso(new Date()), [])

  const selectedDate = useMemo(() => isoToDate(value), [value])

  const [monthDate, setMonthDate] = useState(() => {
    const d = isoToDate(value)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  useEffect(() => {
    if (!open) return

    const d = isoToDate(value)
    setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1))

    const onDocumentClick = (e: MouseEvent) => {
      const el = rootRef.current
      if (!el) return
      const target = e.target
      if (target instanceof Node && !el.contains(target)) {
        onOpenChange(false)
      }
    }

    document.addEventListener("click", onDocumentClick)
    return () => document.removeEventListener("click", onDocumentClick)
  }, [open, onOpenChange, value])

  const buttonText = useMemo(
    () => format(selectedDate, "dd.MM.yyyy"),
    [selectedDate]
  )

  const weekdayLabels = useMemo(
    () => ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"] as const,
    []
  )

  const monthLabel = useMemo(
    () => {
      const s = format(monthDate, "MMMM yyyy", { locale: ruLocale })
      return s ? `${s[0].toUpperCase()}${s.slice(1)}` : s
    },
    [monthDate]
  )

  const cells = useMemo(() => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()

    const first = new Date(year, month, 1)
    // Monday-first index: ПН=0 ... ВС=6
    const startIndex = (first.getDay() + 6) % 7

    const startDate = addDays(first, -startIndex)
    return Array.from({ length: 42 }, (_, i) => addDays(startDate, i))
  }, [monthDate])

  const goPrev = () => {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  const goNext = () => {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  return (
    <div ref={rootRef} className="space-y-3">
      <label className="block text-base font-semibold text-foreground">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          className="
            flex w-full items-center justify-between gap-3 rounded-2xl
            bg-[#2b2b2b] border border-white/10 px-5 py-4
            text-base font-semibold text-foreground
          "
          onClick={() => onOpenChange(!open)}
        >
          <span>{buttonText}</span>
          <ChevronDown
            className={`h-5 w-5 text-[#fbbf24] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open ? (
          <div
            className="
              absolute left-0 top-full z-[9999] mt-2
              animate-in fade-in slide-in-from-bottom-4 duration-300
            "
          >
            <div className="w-[340px] rounded-xl border border-white/10 bg-[#2b2b2b] p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-foreground transition hover:bg-white/10"
                  aria-label="Предыдущий месяц"
                  onClick={goPrev}
                >
                  <span>[</span>
                  <ChevronLeft className="h-5 w-5" />
                  <span>]</span>
                </button>

                <div className="text-base font-bold text-foreground">
                  {monthLabel}
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-foreground transition hover:bg-white/10"
                  aria-label="Следующий месяц"
                  onClick={goNext}
                >
                  <span>[</span>
                  <ChevronRight className="h-5 w-5" />
                  <span>]</span>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 pb-3">
                {weekdayLabels.map((w) => (
                  <div
                    key={w}
                    className="text-[11px] font-semibold text-muted-foreground text-center"
                  >
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {cells.map((d) => {
                  const iso = dateToIso(d)
                  const day = d.getDate()
                  const inMonth = d.getMonth() === monthDate.getMonth()

                  const isActive = iso === value
                  const isToday = iso === todayIso

                  return (
                    <div
                      key={iso}
                      className="
                        w-10 h-10 flex items-center justify-center
                        rounded-full cursor-pointer transition
                        hover:bg-primary/20
                      "
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setMonthDate(
                          new Date(d.getFullYear(), d.getMonth(), 1)
                        )
                        onChange(iso)
                        onOpenChange(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return
                        e.preventDefault()
                        setMonthDate(
                          new Date(d.getFullYear(), d.getMonth(), 1)
                        )
                        onChange(iso)
                        onOpenChange(false)
                      }}
                      style={{
                        borderColor: isToday ? "#fbbf24" : "transparent",
                        borderWidth: isToday ? "1px" : "0px",
                      }}
                    >
                      <span
                        className={
                          isActive
                            ? "flex w-full h-full items-center justify-center rounded-full bg-[#fbbf24] text-black font-bold"
                            : inMonth
                              ? "flex w-full h-full items-center justify-center rounded-full text-foreground"
                              : "flex w-full h-full items-center justify-center rounded-full text-muted-foreground/60"
                        }
                      >
                        {day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

