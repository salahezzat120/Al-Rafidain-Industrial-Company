import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import "../styles/chat-overflow.css"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { SettingsProvider } from "@/contexts/settings-context"

export const metadata: Metadata = {
  title: "Al-Rafidain Delivery Management",
  description: "Centralized delivery management system by Al-Rafidain Industrial Company",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: "/favicon.ico"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className} suppressHydrationWarning={true}>
        <LanguageProvider>
          <AuthProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
