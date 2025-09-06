"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Send, 
  Plus,
  Search,
  Bell,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bot,
  Phone,
  Mail
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import type { InternalMessage, ChatMessage } from "@/types/visits"
import { 
  sendInternalMessage, 
  getMessagesForUser, 
  markMessageAsRead,
  sendChatMessage,
  getChatMessages
} from "@/lib/visits"

export function MessagingTab() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [messages, setMessages] = useState<InternalMessage[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<InternalMessage | null>(null)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [chatInput, setChatInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock users data - in real app, this would come from API
  const users = [
    { id: "1", name: "Admin User", email: "admin@company.com", role: "Admin", avatar: "/admin-avatar.png" },
    { id: "2", name: "Mike Johnson", email: "mike.johnson@company.com", role: "Driver", avatar: "/driver-avatar.png" },
    { id: "3", name: "Sarah Wilson", email: "sarah.wilson@company.com", role: "Supervisor", avatar: "/supervisor-avatar.png" },
    { id: "4", name: "David Chen", email: "david.chen@company.com", role: "Technician", avatar: "/driver-avatar.png" },
  ]

  const [composeData, setComposeData] = useState({
    recipient_id: "",
    recipient_name: "",
    subject: "",
    message: "",
    priority: "medium"
  })

  useEffect(() => {
    loadMessages()
    loadChatMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    setLoading(true)
    try {
      // In real app, this would fetch from API
      const mockMessages: InternalMessage[] = [
        {
          id: "1",
          sender_id: "2",
          sender_name: "Mike Johnson",
          sender_role: "Driver",
          recipient_id: "1",
          recipient_name: "Admin User",
          recipient_role: "Admin",
          subject: "Vehicle Maintenance Issue",
          message: "Hi Admin, I noticed that vehicle VH-001 is making unusual noises. Should I schedule it for maintenance?",
          message_type: "text",
          is_read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          priority: "medium"
        },
        {
          id: "2",
          sender_id: "1",
          sender_name: "Admin User",
          sender_role: "Admin",
          recipient_id: "3",
          recipient_name: "Sarah Wilson",
          recipient_role: "Supervisor",
          subject: "Urgent: Late Visit Alert",
          message: "Sarah, please check on the late visit at XYZ Industries. The delegate is 30 minutes behind schedule.",
          message_type: "urgent",
          is_read: false,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          priority: "urgent"
        },
        {
          id: "3",
          sender_id: "3",
          sender_name: "Sarah Wilson",
          sender_role: "Supervisor",
          recipient_id: "1",
          recipient_name: "Admin User",
          recipient_role: "Admin",
          subject: "Visit Status Update",
          message: "Admin, I've contacted the delegate and they're on their way. ETA is 15 minutes.",
          message_type: "visit_update",
          is_read: true,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          read_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          priority: "high"
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async () => {
    try {
      // In real app, this would fetch from API
      const mockChatMessages: ChatMessage[] = [
        {
          id: "1",
          sender_id: "1",
          sender_name: "Admin User",
          sender_role: "Admin",
          message: "Welcome to the internal chat! How can I help you today?",
          message_type: "user",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_read: true
        },
        {
          id: "2",
          sender_id: "bot",
          sender_name: "System Bot",
          sender_role: "Bot",
          message: "Hello! I'm here to assist with common queries. You can ask me about visit schedules, delegate status, or system information.",
          message_type: "bot",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000).toISOString(),
          is_read: true
        },
        {
          id: "3",
          sender_id: "2",
          sender_name: "Mike Johnson",
          sender_role: "Driver",
          message: "What's my next scheduled visit?",
          message_type: "user",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          is_read: true
        },
        {
          id: "4",
          sender_id: "bot",
          sender_name: "System Bot",
          sender_role: "Bot",
          message: "Your next visit is at ABC Corporation, scheduled for 2:00 PM today. The visit type is delivery with high priority.",
          message_type: "bot",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1000).toISOString(),
          is_read: true
        }
      ]
      setChatMessages(mockChatMessages)
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!composeData.recipient_id || !composeData.subject || !composeData.message) return

    try {
      const messageData = {
        ...composeData,
        sender_id: user?.id || "1",
        sender_name: user?.email || "Admin User",
        sender_role: user?.role || "Admin",
        message_type: "text" as const,
        is_read: false
      }

      // In real app, this would send via API
      console.log('Sending message:', messageData)
      
      setIsComposeModalOpen(false)
      setComposeData({
        recipient_id: "",
        recipient_name: "",
        subject: "",
        message: "",
        priority: "medium"
      })
      loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return

    try {
      const chatData = {
        sender_id: user?.id || "1",
        sender_name: user?.email || "Admin User",
        sender_role: user?.role || "Admin",
        message: chatInput,
        message_type: "user" as const,
        is_read: false
      }

      // In real app, this would send via API
      console.log('Sending chat message:', chatData)
      
      // Add user message
      const newChatMessage: ChatMessage = {
        ...chatData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, newChatMessage])
      setChatInput("")

      // Simulate bot response
      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender_id: "bot",
          sender_name: "System Bot",
          sender_role: "Bot",
          message: "I understand your message. Let me help you with that. This is a simulated response from the chatbot.",
          message_type: "bot",
          timestamp: new Date().toISOString(),
          is_read: false
        }
        setChatMessages(prev => [...prev, botResponse])
      }, 1000)
    } catch (error) {
      console.error('Error sending chat message:', error)
    }
  }

  const handleMarkMessageAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId)
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
      ))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "visit_update":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "system_alert":
        return <Bell className="h-4 w-4 text-yellow-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const unreadMessages = messages.filter(msg => !msg.is_read)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("internalMessaging")}</h2>
          <p className="text-gray-600">{t("communicateWithStaff")}</p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadMessages.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {unreadMessages.length} Unread
            </Badge>
          )}
          <Dialog open={isComposeModalOpen} onOpenChange={setIsComposeModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("composeMessage")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("composeMessage")}</DialogTitle>
                <DialogDescription>
                  {t("sendMessageToStaff")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">{t("recipient")}</Label>
                  <Select value={composeData.recipient_id} onValueChange={(value) => {
                    const recipient = users.find(u => u.id === value)
                    setComposeData(prev => ({ 
                      ...prev, 
                      recipient_id: value, 
                      recipient_name: recipient?.name || "" 
                    }))
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectRecipient")} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.id !== user?.id).map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("subject")}</Label>
                  <Input
                    id="subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={t("enterMessageSubject")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">{t("priority")}</Label>
                  <Select value={composeData.priority} onValueChange={(value) => setComposeData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("low")}</SelectItem>
                      <SelectItem value="medium">{t("medium")}</SelectItem>
                      <SelectItem value="high">{t("high")}</SelectItem>
                      <SelectItem value="urgent">{t("urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t("message")}</Label>
                  <Textarea
                    id="message"
                    value={composeData.message}
                    onChange={(e) => setComposeData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={t("enterYourMessage")}
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComposeModalOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSendMessage}>
                  {t("sendMessage")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="chat">Chat Bot</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.map(message => (
              <Card 
                key={message.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  !message.is_read ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(message)
                  setIsMessageModalOpen(true)
                  if (!message.is_read) {
                    handleMarkMessageAsRead(message.id)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getMessageTypeIcon(message.message_type)}
                        <h3 className="font-semibold">{message.subject}</h3>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority.toUpperCase()}
                        </Badge>
                        {!message.is_read && (
                          <Badge variant="secondary">NEW</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>From: {message.sender_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>To: {message.recipient_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(message.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Internal Chat Bot
              </CardTitle>
              <CardDescription>
                Ask questions about visits, delegates, or system information
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-80">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                        msg.message_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender_role === 'Bot' ? '/bot-avatar.png' : '/user-avatar.png'} />
                          <AvatarFallback>
                            {msg.sender_role === 'Bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg px-3 py-2 ${
                          msg.message_type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.message_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="flex items-center space-x-2 mt-4">
                <Input
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendChatMessage()
                    }
                  }}
                />
                <Button onClick={handleSendChatMessage} disabled={!chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Details Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMessage && getMessageTypeIcon(selectedMessage.message_type)}
              {selectedMessage?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">From</Label>
                  <p className="font-medium">{selectedMessage.sender_name} ({selectedMessage.sender_role})</p>
                </div>
                <div>
                  <Label className="text-gray-500">To</Label>
                  <p className="font-medium">{selectedMessage.recipient_name} ({selectedMessage.recipient_role})</p>
                </div>
                <div>
                  <Label className="text-gray-500">Priority</Label>
                  <Badge className={getPriorityColor(selectedMessage.priority)}>
                    {selectedMessage.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Sent</Label>
                  <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500">Message</Label>
                <div className="bg-gray-50 p-4 rounded-lg mt-2">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
