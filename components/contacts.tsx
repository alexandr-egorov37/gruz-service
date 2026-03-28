"use client"

import { useEffect, useRef } from "react"

export function Contacts() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    section.style.opacity = "1"
    section.style.transform = "none"
  }, [])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    el.style.opacity = "1"
    el.style.transform = "none"
  }, [])

  return (
    <section
      id="contacts"
      ref={sectionRef}
      className="relative overflow-hidden py-28"
    >
      {/* ФОН */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg-5.png')",
          backgroundPosition: "center",
        }}
      />

      {/* ТЁМНЫЙ OVERLAY */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/90 via-black/85 to-black/95" />

      <div className="relative z-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* Только карта (без текста) */}
          <div
            ref={cardRef}
            className="
              h-[280px] w-full overflow-hidden rounded-xl border border-white/10
              bg-black shadow-2xl backdrop-blur-sm md:h-[330px]
            "
          >
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=41.3888%2C56.8486&z=16&pt=41.3888,56.8486,pm2rdm"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              title="Карта: г. Шуя, ул. Малахия Белова, 15"
              className="[filter:invert(90%)_hue-rotate(180deg)_saturate(0.7)_brightness(0.8)_contrast(1.05)] h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
