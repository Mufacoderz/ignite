import type { Metadata } from 'next'
import { Bebas_Neue, Barlow } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const barlow = Barlow({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-barlow',
})

export const metadata: Metadata = {
  title: 'DailyFit — Strong Energy',
  description: 'Your ultimate fitness companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${barlow.variable}`}>
      <body className="bg-stone-950 text-white font-body antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
