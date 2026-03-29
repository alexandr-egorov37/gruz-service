import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Advantages } from "@/components/advantages"
import { Services } from "@/components/services"
import { CalculatorSection } from "@/components/calculator"
import { News } from "@/components/news"
import { Reviews } from "@/components/reviews"
import { Contacts } from "@/components/contacts"
import { TrustBlock } from "@/components/trust-block"

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Advantages />
        <Services />
        <CalculatorSection />
        <News />
        <Reviews />
        <Contacts />
        <TrustBlock />
      </main>
    </>
  )
}
