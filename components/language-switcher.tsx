"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface LanguageSwitcherProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LanguageSwitcher({ className, variant = "ghost" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className={`flex items-center gap-2 ${className || ""}`}
    >
      <Globe className="h-4 w-4" />
      {language === "en" ? "العربية" : "English"}
    </Button>
  )
}
