import { Jost } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from '@/components/SmoothScroll'

const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata = {
  title: 'Bitlabs — Software Studio · Sri Lanka',
  description: 'Bitlabs crafts innovative software solutions for businesses in Sri Lanka and beyond — mobile apps, web platforms, AI and custom software.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jost.variable}>
      <body suppressHydrationWarning><SmoothScroll>{children}</SmoothScroll></body>
    </html>
  )
}
