"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { AlertCircle, Eye, EyeOff, Lock, Mail, Shield, User, Truck, Crown, Users, UserCheck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import Image from "next/image"

function LoginFormContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [representativeId, setRepresentativeId] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "supervisor" | null>(null)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const { t, isRTL } = useLanguage()



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedRole) {
      setError(t("pleaseSelectYourRole"))
      return
    }

    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        // Redirect to main page (admin/supervisor dashboard)
        window.location.href = "/"
      } else {
        setError("Invalid email or password. Please check your credentials and try again.")
      }
    } catch (error) {
      console.error('Login form error:', error)
      setError("An error occurred during login. Please try again.")
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Large geometric shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-10 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
        
        {/* Medium geometric shapes */}
        <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-violet-500/5 rounded-full blur-2xl animate-pulse delay-1500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
        
        {/* Animated lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        {/* Enhanced floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-float-slow ${
                i % 3 === 0 ? 'w-2 h-2 bg-purple-400/30' :
                i % 3 === 1 ? 'w-1 h-1 bg-blue-400/40' :
                'w-1.5 h-1.5 bg-indigo-400/20'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Subtle radial gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-purple-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Centered Login Card */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover-lift animate-fade-in-up animate-border-glow">
            <CardHeader className="text-center space-y-6 pb-8">
              {/* Logo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
                  <div className="relative p-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl animate-pulse-glow">
                    <Image
                      src="/logo.png"
                      alt="Al-Rafidain Industrial Company"
                      width={60}
                      height={60}
                      className="h-15 w-15 object-contain"
                    />
                  </div>
                </div>
              </div>
              
              {/* Company Info */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {isRTL ? "شركة الرفيدان للصناعة" : "Al-Rafidain Industrial"}
                </h1>
                <h2 className="text-lg font-light text-purple-200">
                  {isRTL ? "نظام إدارة التوصيل" : "Delivery Management System"}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isRTL 
                    ? "منصة شاملة لإدارة العمليات اللوجستية والتوصيل"
                    : "Comprehensive logistics and delivery management platform"
                  }
                </p>
              </div>

              {/* Security Badge */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-slate-300 font-medium">Secure Login</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pb-8">
              {/* Role Selection */}
              {!selectedRole ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">{t("selectYourRole")}</h3>
                    <p className="text-sm text-slate-300">{t("chooseYourRoleToContinue")}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Admin Role */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className="group relative p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-white">{t("administrator")}</h4>
                          <p className="text-sm text-slate-300">{t("fullSystemAccess")}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    {/* Supervisor Role */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("supervisor")}
                      className="group relative p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-white">{t("supervisor")}</h4>
                          <p className="text-sm text-slate-300">{t("teamManagement")}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-blue-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Role Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedRole === "admin" && <Crown className="h-5 w-5 text-purple-400" />}
                      {selectedRole === "supervisor" && <Users className="h-5 w-5 text-blue-400" />}
                      {selectedRole === "representative" && <UserCheck className="h-5 w-5 text-green-400" />}
                      <h3 className="text-lg font-semibold text-white capitalize">{selectedRole} Login</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      ← {t("back")}
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{t("auth.email")}</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 backdrop-blur-sm border-white/20 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 text-white placeholder:text-slate-400 h-12 text-base group-hover:bg-white/15"
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Password field - only show for admin and supervisor */}
                {selectedRole !== "representative" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200 font-medium flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>{t("auth.password")}</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/10 backdrop-blur-sm pr-12 border-white/20 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 text-white placeholder:text-slate-400 h-12 text-base group-hover:bg-white/15"
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                )}

                {/* Representative ID field - only show for representatives */}
                {selectedRole === "representative" && (
                  <div className="space-y-2">
                    <Label htmlFor="representativeId" className="text-slate-200 font-medium flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{t("representativeID")}</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="representativeId"
                        type="text"
                        placeholder="REP-12345678"
                        value={representativeId}
                        onChange={(e) => setRepresentativeId(e.target.value.toUpperCase())}
                        required
                        className="bg-white/10 backdrop-blur-sm border-white/20 focus:border-green-400 focus:ring-green-400/20 transition-all duration-300 text-white placeholder:text-slate-400 h-12 text-base group-hover:bg-white/15 font-mono"
                        dir={isRTL ? "rtl" : "ltr"}
                        maxLength={12}
                      />
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-green-600/20 to-green-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password - only show for admin and supervisor */}
                {selectedRole !== "representative" && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <label htmlFor="remember" className="text-slate-300">Remember me</label>
                    </div>
                    <button
                      type="button"
                      className="text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 backdrop-blur-sm border-red-400/50 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 text-red-300" />
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white font-semibold py-3 h-12 text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("common.loading")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{t("auth.signIn")}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </Button>
                  </form>
                </div>
              )}

              {/* Footer */}
              <div className="text-center space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-center space-x-6">
                  <div className="text-center">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm inline-block">
                      <Shield className="h-5 w-5 text-purple-300" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Secure</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm inline-block">
                      <Truck className="h-5 w-5 text-blue-300" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Fast</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm inline-block">
                      <User className="h-5 w-5 text-indigo-300" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Reliable</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400">
                  © 2024 Al-Rafidain Industrial Company. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function LoginForm() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-500 to-purple-600" />
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return <LoginFormContent />
}
