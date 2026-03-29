"use client"

import { useEffect, useRef } from "react"
import { Calculator } from "@/components/Calculator/Calculator"

export function CalculatorSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add(
            "animate-in",
            "fade-in",
            "slide-in-from-bottom-4"
          )
          section.style.animationDuration = "0.6s"
          section.style.animationFillMode = "both"
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="calculator"
      ref={sectionRef}
      className="relative py-24 overflow-visible scroll-mt-28"
    >
      {/* ФОНОВАЯ КАРТИНКА */}
      <div
        className="absolute inset-0 z-0 bg-contain bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg-3.png')",
          backgroundPosition: "center 20%",
        }}
      />

      {/* ЗАТЕМНЕНИЕ */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/85 via-black/75 to-black/90 pointer-events-none" />

      {/* КОНТЕНТ */}
      <div className="relative z-20">
        <Calculator />
      </div>
    </section>
  )
}
