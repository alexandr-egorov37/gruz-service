import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AnalyticsProvider } from '@/components/analytics'
import { QuickModalProvider } from '@/components/quick-modal/QuickModalProvider'
import { SecurityCheck } from '@/components/security-check'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Грузчики за 30 минут | Грузоперевозки 24/7',
  description:
    'Профессиональные грузчики и грузоперевозки. Приезжаем за 30 минут. Работаем круглосуточно. Фиксированные цены без скрытых платежей.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a1f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SecurityCheck />
        <QuickModalProvider>
          {children}
          <AnalyticsProvider />
        </QuickModalProvider>
      </body>
    </html>
  )
}
