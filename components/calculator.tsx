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
      className="relative py-24 overflow-visible scroll-mt-28 z-50"
    >
      {/* ФОН И ЗАТЕМНЕНИЕ В 1 СЛОЕ */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.75), rgba(0,0,0,0.9)), url('/images/hero-bg-3.png')",
          backgroundSize: "contain",
          backgroundPosition: "center 20%",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* КОНТЕНТ */}
      <div className="relative z-20">
        <Calculator />
      </div>
    </section>
  )
}
