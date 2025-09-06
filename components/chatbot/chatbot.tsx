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

interface ChatBotProps {
  className?: string
  isMinimized?: boolean
  onMinimize?: () => void
  onMaximize?: () => void
}

export function ChatBot({ className = "", isMinimized = false, onMinimize, onMaximize }: ChatBotProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
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
          id: "1",
          sender_id: "bot",
          sender_name: "Al-Rafidain Assistant",
          sender_role: "Bot",
          message: `${t("welcomeToAssistant")}\n\n• ${t("visitSchedules")}\n• ${t("systemAlerts")}\n• ${t("deliveryTracking")}\n• ${t("companyInformation")}\n\n${t("howCanIAssist")}`,
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

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_id: user?.id || "1",
      sender_name: user?.email || "User",
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
    { label: t("deliveryInfo"), icon: Truck, action: () => setInput(t("chatbotResponses.deliveryInformation")) }
  ]

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
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
    <div className={`fixed bottom-4 right-4 z-50 w-96 h-[500px] ${className}`}>
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Al-Rafidain Assistant</CardTitle>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">{t("online")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {t("aiAssistant")}
            </Badge>
            <Button
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
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    msg.message_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarImage src={msg.sender_role === 'Bot' ? '/bot-avatar.png' : '/user-avatar.png'} />
                      <AvatarFallback>
                        {msg.sender_role === 'Bot' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg px-3 py-2 ${
                      msg.message_type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.message_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback>
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
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

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t">
            <div className="flex flex-wrap gap-1 mb-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="text-xs h-7"
                >
                  <action.icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                placeholder={t("askMeAnything")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isTyping}
                size="sm"
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
