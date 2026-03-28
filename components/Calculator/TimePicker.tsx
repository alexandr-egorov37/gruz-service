"use client"

import { useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { Dropdown } from "./Dropdown"
import type { DropdownOption } from "./Dropdown"

type TimePickerProps = {
  openId: string | null
  setOpenId: (id: string | null) => void
  valueHour: string
  valueMinute: string
  onChange: (next: { hour: string; minute: string }) => void
}

const hourOptions: DropdownOption[] = Array.from({ length: 24 }, (_, i) => {
  const v = `${i}`.padStart(2, "0")
  return { value: v, label: v }
})

const minuteOptions: DropdownOption[] = ["00", "15", "30", "45"].map((v) => ({
  value: v,
  label: v,
}))

export function TimePicker({
  openId,
  setOpenId,
  valueHour,
  valueMinute,
  onChange,
}: TimePickerProps) {
  const hourOpen = openId === "timeHour"
  const minuteOpen = openId === "timeMinute"

  const hourSelected = useMemo(() => valueHour, [valueHour])
  const minuteSelected = useMemo(() => valueMinute, [valueMinute])

  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-foreground">
        Время (часы + минуты)
      </label>

      <div className="flex gap-3">
        {/* Hours */}
        <div className="flex-1">
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={hourOpen}
              className="
                flex w-full items-center justify-between gap-3 rounded-xl
                bg-[#2b2b2b] border border-white/10 px-5 py-4
                text-base font-semibold text-foreground
                transition hover:border-[#fbbf24]/70
                "
              onClick={() =>
                setOpenId(hourOpen ? null : "timeHour")
              }
            >
              <span>{hourSelected}</span>
              <ChevronDown
                className={`h-5 w-5 text-[#fbbf24] transition-transform ${
                  hourOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <Dropdown
              id="timeHour"
              open={hourOpen}
              title="Часы"
              value={hourSelected}
              options={hourOptions}
              onChange={(v) => onChange({ hour: v, minute: valueMinute })}
              onOpenChange={(open) => setOpenId(open ? "timeHour" : null)}
            />
          </div>
        </div>

        {/* Minutes */}
        <div className="flex-1">
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={minuteOpen}
              className="
                flex w-full items-center justify-between gap-3 rounded-xl
                bg-[#2b2b2b] border border-white/10 px-5 py-4
                text-base font-semibold text-foreground
                transition hover:border-[#fbbf24]/70
                "
              onClick={() =>
                setOpenId(minuteOpen ? null : "timeMinute")
              }
            >
              <span>{minuteSelected}</span>
              <ChevronDown
                className={`h-5 w-5 text-[#fbbf24] transition-transform ${
                  minuteOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <Dropdown
              id="timeMinute"
              open={minuteOpen}
              title="Минуты"
              value={minuteSelected}
              options={minuteOptions}
              onChange={(v) => onChange({ hour: valueHour, minute: v })}
              onOpenChange={(open) =>
                setOpenId(open ? "timeMinute" : null)
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

