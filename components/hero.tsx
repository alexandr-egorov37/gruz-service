"use client"

import { useEffect, useRef, useState } from "react"
import { Phone, Calculator, ChevronDown } from "lucide-react"

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  const [city, setCity] = useState<"Шуя" | "Иваново">("Шуя")
  const [isCityOpen, setIsCityOpen] = useState(false)
  const cityRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    section.style.opacity = "0"
    section.style.transform = "translateY(30px)"
    requestAnimationFrame(() => {
      section.style.transition = "opacity 0.8s ease, transform 0.8s ease"
      section.style.opacity = "1"
      section.style.transform = "translateY(0)"
    })
  }, [])

  useEffect(() => {
    if (!isCityOpen) return
    const onDocClick = (e: MouseEvent) => {
      const el = cityRef.current
      if (!el) return
      const target = e.target
      if (target instanceof Node && !el.contains(target)) {
        setIsCityOpen(false)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [isCityOpen])

  return (
    <>
      <section
        ref={sectionRef}
        className="relative min-h-screen overflow-hidden flex items-center"
      >
      {/* фон */}
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: "100% 100%",
        }}
      />

      {/* затемнение */}
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      {/* контент */}
      <div className="relative z-10 w-full px-6 md:px-10">
        <div className="flex items-center justify-center text-center">
          <div className="max-w-[900px] mx-auto text-center">

            <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-base font-semibold text-primary">
                  Работаем 24/7
                </span>
              </div>

              <div ref={cityRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsCityOpen((v) => !v)}
                  className="
                    flex items-center gap-2 rounded-xl border border-border
                    bg-background/30 px-4 py-2 text-base font-semibold text-foreground
                  "
                  aria-haspopup="listbox"
                  aria-expanded={isCityOpen}
                >
                  <span className="text-muted-foreground">Выбрать город:</span>
                  <span>{city}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-primary transition-transform ${
                      isCityOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCityOpen ? (
                  <div
                    className="
                      absolute left-0 top-full z-[1200] mt-2 w-44
                      overflow-hidden rounded-xl border border-white/10
                      bg-[#2b2b2b] shadow-xl
                    "
                    role="listbox"
                    aria-label="Город"
                  >
                    {(["Шуя", "Иваново"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCity(c)
                          setIsCityOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-left text-base font-semibold transition hover:bg-white/5 ${
                          c === city ? "text-black bg-[#fbbf24]" : "text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <h1 className="text-[48px] sm:text-[56px] md:text-[72px] lg:text-[88px] xl:text-[96px] font-bold leading-[1.05] tracking-tight text-center">
  <span className="whitespace-nowrap">
    Грузчики за <span className="text-primary">30 минут</span>
  </span>
  <br />
  в {city === "Шуя" ? "Шуе" : "Иваново"}
</h1>

            <p className="mt-6 mx-auto max-w-[700px] text-center text-lg sm:text-xl md:text-2xl leading-relaxed text-muted-foreground">
              Без опозданий и скрытых платежей. Профессиональная команда
              грузчиков для любых задач.
            </p>

            {/* кнопки */}
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <button
                type="button"
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base sm:text-lg md:text-xl font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                onClick={() => {
                  document
                    .getElementById("calculator")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
              >
                <Calculator className="h-6 w-6" />
                Рассчитать стоимость
              </button>

              <a
                href="tel:+79203507778"
                className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl border border-border bg-secondary px-8 py-4 text-base sm:text-lg md:text-xl font-bold text-foreground transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Phone className="h-6 w-6" />
                Позвонить
              </a>
            </div>

            {/* статистика */}
            <div className="mt-12 flex flex-wrap justify-center gap-10">
              {[
                { value: "500+", label: "Выполненных заказов" },
                { value: "30 мин", label: "Среднее время подачи" },
                { value: "4.9", label: "Рейтинг клиентов" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-black text-primary">
                    {stat.value}
                  </span>
                  <span className="text-sm md:text-base text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
      </section>
    </>
  )
}