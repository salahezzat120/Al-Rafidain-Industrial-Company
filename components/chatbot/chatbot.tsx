"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  User, 
  Send, 
  MessageSquare, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Truck
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import type { ChatMessage } from "@/types/visits"
import { sendChatMessage, getChatMessages } from "@/lib/visits"

// Build welcome message based on user role
const buildWelcomeMessage = (userRole?: string): string => {
  const role = userRole?.toLowerCase() || 'user'
  
  switch (role) {
    case 'admin':
      return "Welcome, Administrator! I'm here to help you manage the delivery system. You can ask me about system status, user management, analytics, or any administrative tasks."
    case 'supervisor':
      return "Hello, Supervisor! I can assist you with team management, delivery tracking, performance reports, and operational oversight. How can I help you today?"
    case 'representative':
      return "Hi there! I'm your delivery assistant. I can help you with route information, delivery updates, customer details, and any questions about your assigned tasks."
    default:
      return "Welcome to Al-Rafidain Industrial Delivery Management System! I'm here to help you with any questions about deliveries, tracking, or system features."
  }
}

interface ChatBotProps {
  className?: string
  isMinimized?: boolean
  onMinimize?: () => void
  onMaximize?: () => void
  onNavigateToChatSupport?: () => void
}

export function ChatBot({ className = "", isMinimized = false, onMinimize, onMaximize, onNavigateToChatSupport }: ChatBotProps) {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const [feedback, setFeedback] = useState<null | 'up' | 'down'>(null)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isMinimized])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    try {
      // In real app, this would fetch from API
      const mockMessages: ChatMessage[] = [
        {
          id: "welcome",
          sender_id: "bot",
          sender_name: "Al-Rafidain Assistant",
          sender_role: "Bot",
          message: buildWelcomeMessage(user?.role),
          message_type: "bot",
          timestamp: new Date().toISOString(),
          is_read: true
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  // Update the welcome message when language changes
  useEffect(() => {
    setMessages(prev => prev.map(m => m.id === 'welcome' ? { ...m, message: buildWelcomeMessage() } : m))
  }, [language])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Navigate to chat support tab instead of sending a message
    if (onNavigateToChatSupport) {
      onNavigateToChatSupport()
      return
    }

    // Fallback to original behavior if navigation function is not provided
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_id: user?.id || "1",
      sender_name: user?.email || (user?.id ?? "User"),
      sender_role: user?.role || "User",
      message: input,
      message_type: "user",
      timestamp: new Date().toISOString(),
      is_read: false
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = generateBotResponse(input)
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender_id: "bot",
        sender_name: "Al-Rafidain Assistant",
        sender_role: "Bot",
        message: botResponse,
        message_type: "bot",
        timestamp: new Date().toISOString(),
        is_read: false
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    // Visit-related queries
    if (input.includes('visit') || input.includes('schedule') || input.includes('appointment')) {
      return `${t("chatbotResponses.visitInfo")}\n\n📅 **${t("chatbotResponses.todaysVisits")}**\n• Mike Johnson - ABC Corporation (2:00 PM)\n• Sarah Wilson - XYZ Industries (3:30 PM)\n• David Chen - Tech Solutions Ltd (4:00 PM)\n\nWould you like details about any specific visit?`
    }

    // Delegate-related queries
    if (input.includes('delegate') || input.includes('driver') || input.includes('staff')) {
      return `${t("chatbotResponses.delegateStatus")}\n\n👥 **${t("chatbotResponses.activeDelegates")}**\n• Mike Johnson - Available (Downtown)\n• Sarah Wilson - On Route (North Zone)\n• David Chen - Available (East District)\n\n${t("chatbotResponses.allDelegatesActive")}`
    }

    // Alert-related queries
    if (input.includes('alert') || input.includes('notification') || input.includes('urgent')) {
      return `🚨 **${t("chatbotResponses.currentAlerts")}**\n\n• **${t("high")} Priority:** Sarah Wilson is late for visit at XYZ Industries\n• **${t("medium")} Priority:** David Chen has exceeded time limit at Tech Solutions Ltd\n• **${t("info")}:** Vehicle VH-001 maintenance due in 2 days\n\nWould you like me to provide more details about any of these alerts?`
    }

    // Delivery-related queries
    if (input.includes('delivery') || input.includes('package') || input.includes('shipment')) {
      return `📦 **${t("chatbotResponses.deliveryStatus")}**\n\n• **${t("chatbotResponses.inTransit")}:** 3 deliveries\n• **${t("chatbotResponses.completedToday")}:** 12 deliveries\n• **${t("chatbotResponses.scheduled")}:** 8 deliveries\n\n${t("chatbotResponses.averageDeliveryTime")}: 45 minutes\n${t("chatbotResponses.onTimeDeliveryRate")}: 94%\n\nNeed specific delivery information?`
    }

    // Vehicle-related queries
    if (input.includes('vehicle') || input.includes('truck') || input.includes('fleet')) {
      return `🚛 **${t("chatbotResponses.fleetStatus")}**\n\n• **${t("chatbotResponses.activeVehicles")}:** 8/10\n• **${t("chatbotResponses.inMaintenance")}:** 2 vehicles\n• **${t("chatbotResponses.fuelLevel")}:** All vehicles above 25%\n\n**${t("chatbotResponses.maintenanceAlerts")}**\n• VH-001: Service due in 2 days\n• VH-007: Oil change recommended\n\nWould you like detailed vehicle information?`
    }

    // Time-related queries
    if (input.includes('time') || input.includes('late') || input.includes('schedule')) {
      return `⏰ **${t("chatbotResponses.timeManagement")}**\n\n• **${t("chatbotResponses.currentTime")}:** ${new Date().toLocaleTimeString()}\n• **${t("chatbotResponses.lateVisits")}:** 1 (Sarah Wilson - 30 min late)\n• **${t("chatbotResponses.exceededTime")}:** 1 (David Chen - 15 min over)\n\nI can help you reschedule or get updates on any visits.`
    }

    // Location-related queries
    if (input.includes('location') || input.includes('where') || input.includes('address')) {
      return `📍 **${t("chatbotResponses.locationInformation")}**\n\n• **${t("chatbotResponses.activeZones")}:** Downtown, North Zone, East District\n• **${t("chatbotResponses.coverageAreas")}:** 15 districts total\n• **${t("chatbotResponses.currentOperations")}:** 3 zones active\n\nNeed specific location details or directions?`
    }

    // Greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return `${t("chatbotResponses.greeting")}\n\n• ${t("chatbotResponses.visitManagement")}\n• ${t("chatbotResponses.delegateInformation")}\n• ${t("chatbotResponses.systemAlerts")}\n• ${t("chatbotResponses.deliveryTracking")}\n• Vehicle fleet status\n\nWhat would you like to know?`
    }

    // Help requests
    if (input.includes('help') || input.includes('assist') || input.includes('support')) {
      return `${t("chatbotResponses.helpTopics")}\n\n**${t("chatbotResponses.visitManagement")}**\n• "${t("chatbotResponses.showTodaysVisits")}"\n• "Is anyone late?"\n• "Schedule a new visit"\n\n**${t("chatbotResponses.delegateInformation")}**\n• "Where is Mike Johnson?"\n• "${t("chatbotResponses.delegateStatus")}"\n• "Who's available?"\n\n**${t("chatbotResponses.systemAlerts")}**\n• "${t("chatbotResponses.anyAlerts")}"\n• "Show notifications"\n• "Check system status"\n\n**${t("chatbotResponses.deliveryTracking")}**\n• "${t("chatbotResponses.deliveryInformation")}"\n• "Track package"\n• "Show completed deliveries"\n\n${t("chatbotResponses.justAsk")}`
    }

    // Default response
    return `${t("chatbotResponses.defaultResponse")} "${userInput}"\n\n${t("chatbotResponses.beMoreSpecific")}\n\n${t("chatbotResponses.tryAsking")}:\n• "${t("chatbotResponses.showTodaysVisits")}"\n• "${t("chatbotResponses.anyAlerts")}"\n• "${t("chatbotResponses.delegateStatus")}"\n• "${t("chatbotResponses.deliveryInformation")}"`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: t("todaysVisits"), icon: Calendar, action: () => setInput(t("chatbotResponses.showTodaysVisits")) },
    { label: t("activeAlerts"), icon: AlertTriangle, action: () => setInput(t("chatbotResponses.anyAlerts")) },
    { label: t("delegateStatus"), icon: User, action: () => setInput(t("chatbotResponses.delegateStatus")) },
    { label: t("deliveryInfo"), icon: Truck, action: () => setInput(t("chatbotResponses.deliveryInformation")) },
    { label: t("scheduleVisit"), icon: Calendar, action: () => setInput(t("scheduleVisit")) }
  ]

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-50 ${className}`}>
        <Button
          aria-label={t("maximize")}
          title={t("maximize")}
          onClick={onMaximize}
          className="rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-50 w-96 max-w-[94vw] h-[500px] ${className}`}>
      <Card className="h-full flex flex-col shadow-xl" role="dialog" aria-label={t("assistantTitle")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{t("assistantTitle")}</CardTitle>
              <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                <div className="h-2 w-2 bg-green-500 rounded-full" aria-hidden />
                <span className="text-xs text-gray-500">{t("online")}</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
            <Badge variant="secondary" className="text-xs">
              {t("aiAssistant")}
            </Badge>
            <Button
              aria-label={t("minimize")}
              title={t("minimize")}
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4 overflow-y-auto max-h-[350px] chat-scroll-container">
            <div className="space-y-4 py-4">
              {/* Personalized greeting bubble shown once at top */}
              <div className="flex justify-start">
                <div className={`flex items-start ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback>
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="text-sm">
                      {t("hello")} {user?.email ? user.email.split('@')[0] : ''}. {t("howCanIAssist")}
                    </p>
                  </div>
                </div>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start max-w-[80%] ${language === 'ar' ? 'space-x-reverse' : ''} ${msg.message_type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarImage src={msg.sender_role === 'Bot' ? '/bot-avatar.png' : '/user-avatar.png'} />
                      <AvatarFallback>
                        {msg.sender_role === 'Bot' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg px-3 py-2 max-w-[80%] break-words overflow-hidden ${msg.message_type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <p 
                        className="text-sm whitespace-pre-wrap break-words"
                        style={{
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere',
                          hyphens: 'auto',
                          whiteSpace: 'normal',
                          maxWidth: '100%',
                          overflow: 'hidden'
                        }}
                      >
                        {msg.message}
                      </p>
                      <p className={`text-xs mt-1 ${msg.message_type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className={`flex items-start ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback>
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-3 py-2" aria-live="polite">
                      <div className={`flex ${language === 'ar' ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions + Feedback */}
          <div className="px-4 py-2 border-t">
            <div className="flex flex-wrap gap-1 mb-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="text-xs h-7"
                  aria-label={action.label}
                  title={action.label}
                >
                  <action.icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Feedback controls */}
            <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'} mb-2`}>
              <span className="text-xs text-gray-500">{t("provideFeedback")}:</span>
              <Button
                variant={feedback === 'up' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                aria-pressed={feedback === 'up'}
                aria-label={t("helpful")}
                title={t("helpful")}
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button
                variant={feedback === 'down' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                aria-pressed={feedback === 'down'}
                aria-label={t("notHelpful")}
                title={t("notHelpful")}
              >
                <AlertTriangle className="h-3 w-3" />
              </Button>
              <Input
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder={t("optionalComment")}
                className="h-8 text-xs"
                aria-label={t("optionalComment")}
              />
              <Button size="sm" onClick={() => { setFeedback(null); setFeedbackComment("") }} aria-label={t("submit")} title={t("submit")}>
                {t("submit")}
              </Button>
            </div>

            <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Input
                ref={inputRef}
                placeholder={t("askMeAnything")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isTyping}
                aria-label={t("askMeAnything")}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isTyping}
                size="sm"
                aria-label={t("send")}
                title={t("send")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
