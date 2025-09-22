import { useEffect, useState, useRef } from "react"
import { getChatMessages, sendChatMessage, getChatRepresentatives } from "@/lib/representative-live-locations"
import { ChatMessage } from "@/types/representative-live-locations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2, 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  MapPin,
  Image as ImageIcon,
  FileText,
  Clock,
  Check,
  CheckCheck,
  Circle,
  MessageCircle,
  Users,
  Filter
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/contexts/language-context"

export default function ChatSupportTab() {
  const { t, isRTL } = useLanguage()
  const [representatives, setRepresentatives] = useState<{ id: string; name: string; lastMessage?: string; unreadCount?: number; isOnline?: boolean; lastSeen?: string }[]>([])
  const [selectedRep, setSelectedRep] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [repsLoading, setRepsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const subscriptionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Helper functions
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

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
      setIsTyping(false)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set typing indicator
    setIsTyping(true)
    
    // Clear typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const filteredRepresentatives = representatives.filter(rep =>
    rep.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedRepresentative = representatives.find(rep => rep.id === selectedRep)

  return (
    <div className="flex h-[75vh] bg-white rounded-lg shadow-lg overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Representatives Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              {isRTL ? "دعم الدردشة" : "Chat Support"}
            </h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Users className="h-3 w-3 mr-1" />
              {representatives.length}
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={isRTL ? "البحث عن المندوبين..." : "Search representatives..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Representatives List */}
        <ScrollArea className="flex-1">
          {repsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          ) : filteredRepresentatives.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {searchQuery ? 
                  (isRTL ? "لا توجد نتائج" : "No results found") : 
                  (isRTL ? "لا يوجد مندوبين" : "No representatives found")
                }
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredRepresentatives.map(rep => (
                <div
                  key={rep.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                    selectedRep === rep.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedRep(rep.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/representative-avatar.png" alt={rep.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                          {rep.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {rep.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{rep.name}</p>
                        {rep.unreadCount && rep.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                            {rep.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {rep.lastMessage || (isRTL ? "لا توجد رسائل" : "No messages")}
                      </p>
                      {rep.lastSeen && (
                        <p className="text-xs text-gray-400">
                          {rep.isOnline ? 
                            (isRTL ? "متصل الآن" : "Online") : 
                            `${isRTL ? "آخر ظهور" : "Last seen"} ${formatLastSeen(rep.lastSeen)}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedRep ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isRTL ? "اختر مندوباً للبدء" : "Select a representative to start"}
              </h3>
              <p className="text-gray-500">
                {isRTL ? "اختر مندوباً من القائمة لبدء المحادثة" : "Choose a representative from the list to start chatting"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/representative-avatar.png" alt={selectedRepresentative?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {selectedRepresentative?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRepresentative?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedRepresentative?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedRepresentative?.isOnline ? 
                        (isRTL ? "متصل الآن" : "Online") : 
                        `${isRTL ? "آخر ظهور" : "Last seen"} ${selectedRepresentative?.lastSeen ? formatLastSeen(selectedRepresentative.lastSeen) : ''}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Circle className="h-12 w-12 mx-auto mb-3 text-red-400" />
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">
                      {isRTL ? "لا توجد رسائل بعد" : "No messages yet"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {isRTL ? "ابدأ المحادثة بإرسال رسالة" : "Start the conversation by sending a message"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isAdmin = msg.sender_type === 'admin'
                    const showAvatar = index === 0 || messages[index - 1].sender_type !== msg.sender_type
                    const showTime = index === messages.length - 1 || 
                      new Date(msg.created_at || '').getTime() - new Date(messages[index + 1].created_at || '').getTime() > 300000 // 5 minutes
                    
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && showAvatar && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src="/representative-avatar.png" alt={selectedRepresentative?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                              {selectedRepresentative?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isAdmin && !showAvatar && <div className="w-8" />}
                        
                        <div className={`max-w-[70%] ${isAdmin ? 'order-1' : 'order-2'}`}>
                          <div className={`rounded-2xl px-4 py-2 ${
                            isAdmin 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          {showTime && (
                            <div className={`text-xs text-gray-500 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                              {msg.created_at && formatTime(msg.created_at)}
                              {isAdmin && (
                                <span className="ml-1">
                                  {msg.is_read ? (
                                    <CheckCheck className="h-3 w-3 inline text-blue-500" />
                                  ) : (
                                    <Check className="h-3 w-3 inline" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {isAdmin && !showAvatar && <div className="w-8" />}
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
                <Button variant="ghost" size="sm" className="p-2">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={isRTL ? "اكتب رسالة..." : "Type a message..."}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    disabled={sending}
                    className="pr-12 resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSend} 
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>{isRTL ? "يكتب..." : "Typing..."}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
