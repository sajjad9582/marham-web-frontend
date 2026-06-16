import { GoogleTagManager } from "@next/third-parties/google"
// import { Open_Sans } from "next/font/google"
import { Poppins } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import Footer from "@/components/layout/Footer"
import { getAppOrigin, shouldNoIndex } from "@/lib/urls/site-urls"
import { cn } from "@/lib/utils"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // add weights you actually use
  variable: "--font-sans",
  display: "swap",
  
  fallback: ["system-ui", "sans-serif"],
})

const gtmId = process.env.NEXT_PUBLIC_GTM_ID
const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"

export const metadata: Metadata = {
  metadataBase: new URL(getAppOrigin()),
  ...(shouldNoIndex() ? { robots: { index: false, follow: false } } : {}),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased font-sans", poppins.variable)}
    >
      {analyticsEnabled && gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      <body className="min-h-svh bg-pagegray font-sans">
        <SiteHeader />
        {children}
        <Footer />
      </body>
    </html>
  )
}
