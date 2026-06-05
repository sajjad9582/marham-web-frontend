import { Open_Sans } from "next/font/google"

import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { cn } from "@/lib/utils"
import Footer from "@/components/layout/Footer"

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased font-sans", openSans.variable)}
    >
      <body className="min-h-svh bg-pagegray font-sans">
          <SiteHeader />
          {children}
          <Footer />
      </body>
    </html>
  )
}
