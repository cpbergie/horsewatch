import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HorseWatch — Trusted horse care, when you can\'t be there.',
  description:
    'Connect with experienced horse caretakers in the Atlanta area. HorseWatch is the trusted marketplace for horse owners who need reliable care coverage.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased bg-[#FAF9F6] text-[#1A1A1A]`}>
        {children}
      </body>
    </html>
  )
}
