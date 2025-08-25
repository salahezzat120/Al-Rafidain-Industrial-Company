"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThreeDLoginBackground } from "./3d-login-background"
import Image from "next/image"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const { t, isRTL } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (!success) {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ThreeDLoginBackground />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md backdrop-blur-md bg-white/90 border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg">
              <Image
                src="/logo.png"
                alt="Al-Rafidain Industrial Company"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isRTL ? "شركة الرفيدان للصناعة" : "Al-Rafidain Industrial Company"}
          </CardTitle>
          <CardDescription className="text-gray-700">{t("auth.selectRole")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/80 backdrop-blur-sm"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/80 backdrop-blur-sm"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50/90 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full shadow-lg" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.signIn")}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <strong>{t("auth.admin")}:</strong> admin@delivery.com / admin123
              </p>
              <p>
                <strong>{t("auth.supervisor")}:</strong> supervisor@delivery.com / super123
              </p>
              <p>
                <strong>{t("auth.driver")}:</strong> driver@delivery.com / driver123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
