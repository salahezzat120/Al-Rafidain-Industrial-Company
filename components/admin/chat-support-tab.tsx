import { useEffect, useState, useRef } from "react"
import { getChatMessages, sendChatMessage, getChatRepresentatives, logCallAttempt } from "@/lib/representative-live-locations"
import { ChatMessage } from "@/types/representative-live-locations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Loader2, 
  Send, 
  User, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  MapPin,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Info
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/contexts/language-context"

export default function ChatSupportTab() {
  const { language, t } = useLanguage()
  const [representatives, setRepresentatives] = useState<{ id: string; name: string; is_online?: boolean; last_seen?: string; unread_count?: number }[]>([])
  const [selectedRep, setSelectedRep] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [repsLoading, setRepsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const subscriptionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRepsLoading(true)
    getChatRepresentatives().then(res => {
      if (res.error) setError(res.error)
      else setRepresentatives(res.data || [])
      setRepsLoading(false)
    })
  }, [])

  // Fetch messages and subscribe to realtime updates
  useEffect(() => {
    if (!selectedRep) return
    setLoading(true)
    getChatMessages(selectedRep).then(res => {
      if (res.error) setError(res.error)
      else setMessages(res.data || [])
      setLoading(false)
    })

    // Subscribe to new chat messages for this rep
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
      subscriptionRef.current = null
    }
    const channel = supabase.channel(`chat-messages-${selectedRep}`)
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `representative_id=eq.${selectedRep}`,
      },
      (payload) => {
        const msg = payload.new as ChatMessage
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
    )
    channel.subscribe()
    subscriptionRef.current = channel
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [selectedRep])

  // Auto-scroll to bottom on new messages or rep change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, selectedRep])

  const handleSend = async () => {
    if (!selectedRep || !newMessage.trim()) return
    setSending(true)
    const res = await sendChatMessage({
      representative_id: selectedRep,
      content: newMessage,
      sender_type: "admin",
      message_type: "text",
    })
    setSending(false)
    if (!res.error) {
      setNewMessage("")
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getMessageIcon = (messageType: string, senderType: string) => {
    switch (messageType) {
      case 'location':
        return <MapPin className="w-4 h-4" />
      case 'image':
        return <Paperclip className="w-4 h-4" />
      case 'file':
        return <Paperclip className="w-4 h-4" />
      default:
        return senderType === 'system' ? <Info className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />
    }
  }

  const getMessageStyle = (message: ChatMessage) => {
    const baseStyle = "max-w-[75%] min-w-0 rounded-2xl px-4 py-3 mb-2 shadow-sm break-words overflow-hidden chat-bubble"
    
    switch (message.sender_type) {
      case 'admin':
        return `${baseStyle} bg-blue-500 text-white self-end ml-12`
      case 'system':
        return `${baseStyle} bg-amber-100 text-amber-800 self-center border border-amber-200`
      default:
        return `${baseStyle} bg-gray-100 text-gray-900 self-start mr-12`
    }
  }

  const getRepresentativeStatus = (rep: any) => {
    if (rep.is_online) {
      return <Badge variant="default" className="bg-green-500 text-white text-xs">Online</Badge>
    } else if (rep.last_seen) {
      const lastSeen = new Date(rep.last_seen)
      const now = new Date()
      const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
      
      if (diffInMinutes < 5) {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">Just now</Badge>
      } else if (diffInMinutes < 60) {
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">{Math.floor(diffInMinutes)}m ago</Badge>
      } else {
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Offline</Badge>
      }
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Offline</Badge>
  }

  const handleCall = async (representative: any) => {
    if (!representative || !representative.phone) {
      alert(language === 'ar' ? 'رقم الهاتف غير متوفر' : 'Phone number not available')
      return
    }

    // Create a phone call link
    const phoneNumber = representative.phone.replace(/\D/g, '') // Remove non-digits
    const callUrl = `tel:${phoneNumber}`
    
    // Try to initiate the call
    try {
      // Log the call attempt for tracking
      console.log(`Calling ${representative.name} at ${representative.phone}`)
      
      // Log the call attempt to the database
      await logCallAttempt(representative.id, representative.phone, 'outgoing')
      
      // For web browsers, this will open the default phone app
      window.open(callUrl, '_self')
      
    } catch (error) {
      console.error('Error initiating call:', error)
      alert(language === 'ar' ? 'خطأ في بدء المكالمة' : 'Error initiating call')
    }
  }

  return (
    <div className="flex h-[75vh] bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Representatives Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            {language === 'ar' ? 'المندوبين' : 'Representatives'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'ar' ? 'اختر مندوب للبدء في المحادثة' : 'Select a representative to start chatting'}
          </p>
        </div>

        {/* Representatives List */}
        <ScrollArea className="flex-1 overflow-y-auto max-h-[50vh] chat-scroll-container">
          {repsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : representatives.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'ar' ? 'لا يوجد مندوبين' : 'No representatives available'}</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {representatives.map(rep => (
                <div
                  key={rep.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                    selectedRep === rep.id ? 'bg-blue-50 border border-blue-200' : 'hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedRep(rep.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {rep.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{rep.name}</p>
                        <div className="flex items-center gap-1">
                          {rep.unread_count && rep.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {rep.unread_count}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCall(rep)
                            }}
                            title={language === 'ar' ? 'اتصال' : 'Call'}
                          >
                            <Phone className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getRepresentativeStatus(rep)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedRep ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50/30">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'ar' ? 'اختر مندوب للبدء' : 'Select a Representative'}
              </h3>
              <p className="text-gray-500">
                {language === 'ar' ? 'اختر مندوب من القائمة لبدء المحادثة' : 'Choose a representative from the list to start chatting'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                      {representatives.find(r => r.id === selectedRep)?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {representatives.find(r => r.id === selectedRep)?.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {getRepresentativeStatus(representatives.find(r => r.id === selectedRep))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCall(representatives.find(r => r.id === selectedRep))}
                    title={language === 'ar' ? 'اتصال' : 'Call'}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 overflow-y-auto max-h-[60vh] chat-scroll-container">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">
                      {language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {language === 'ar' ? 'ابدأ المحادثة بإرسال رسالة' : 'Start the conversation by sending a message'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1]
                    const showAvatar = !prevMsg || prevMsg.sender_type !== msg.sender_type
                    const showTime = !prevMsg || 
                      new Date(msg.created_at || '').getTime() - new Date(prevMsg.created_at || '').getTime() > 300000 // 5 minutes
                    
                    return (
                      <div key={msg.id} className={`flex gap-3 ${msg.sender_type === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {showAvatar && msg.sender_type !== 'admin' && msg.sender_type !== 'system' && (
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                              {msg.sender_type === 'representative' ? 'R' : 'S'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {msg.sender_type === 'admin' && showAvatar && (
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">A</AvatarFallback>
                          </Avatar>
                        )}
                        {msg.sender_type === 'system' && showAvatar && (
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarFallback className="bg-amber-100 text-amber-600 text-xs">S</AvatarFallback>
                          </Avatar>
                        )}
                        {!showAvatar && msg.sender_type !== 'admin' && msg.sender_type !== 'system' && (
                          <div className="w-8" />
                        )}
                        {msg.sender_type === 'admin' && !showAvatar && (
                          <div className="w-8" />
                        )}
                        {msg.sender_type === 'system' && !showAvatar && (
                          <div className="w-8" />
                        )}
                        
                        <div className={`flex flex-col ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                          <div className={getMessageStyle(msg)} style={{ maxWidth: '75%', overflow: 'hidden', wordBreak: 'break-all' }}>
                            <div className="flex items-start gap-2 min-w-0 chat-message-container" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                              {getMessageIcon(msg.message_type, msg.sender_type)}
                              <div className="flex-1 min-w-0 overflow-hidden chat-message-content" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                                <p 
                                  className="text-sm leading-relaxed break-words whitespace-pre-wrap chat-message force-wrap"
                                  style={{
                                    wordBreak: 'break-all',
                                    overflowWrap: 'anywhere',
                                    hyphens: 'auto',
                                    whiteSpace: 'normal',
                                    maxWidth: '100%',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          </div>
                          {showTime && msg.created_at && (
                            <div className={`text-xs text-gray-500 mt-1 ${msg.sender_type === 'admin' ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.created_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                      onKeyDown={handleKeyPress}
                      disabled={sending}
                      className="pr-12 resize-none"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="px-6"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
