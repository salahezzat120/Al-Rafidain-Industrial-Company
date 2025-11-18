import { useEffect, useState, useRef, useMemo } from "react"
import { getChatMessages, sendChatMessage, getAllChatRepresentatives, logCallAttempt, markMessagesAsRead, getLastLocationForRepresentative } from "@/lib/representative-live-locations"
import { ChatMessage, RepresentativeLiveLocation } from "@/types/representative-live-locations"
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
  Info,
  Search,
  Navigation
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/contexts/language-context"

interface ChatSupportTabProps {
  onNavigateToLiveMap?: (representativeName: string) => void
}

export default function ChatSupportTab({ onNavigateToLiveMap }: ChatSupportTabProps = {}) {
  const { language, t, isRTL } = useLanguage()
  const [representatives, setRepresentatives] = useState<{ id: string; name: string; phone?: string; is_online?: boolean; last_seen?: string; unread_count?: number; last_message_time?: string | null }[]>([])
  const [selectedRep, setSelectedRep] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [repsLoading, setRepsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [lastLocation, setLastLocation] = useState<RepresentativeLiveLocation | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const subscriptionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Function to refresh representatives list
  const refreshRepresentatives = async () => {
    const res = await getAllChatRepresentatives()
    if (res.error) {
      console.error('Error refreshing representatives:', res.error)
      return { data: null, error: res.error }
    } else {
      const data = res.data || []
      setRepresentatives(data)
      return { data, error: null }
    }
  }

  useEffect(() => {
    setRepsLoading(true)
    refreshRepresentatives().then((res) => {
      setRepsLoading(false)
      
      // Check for representative ID in URL parameter after representatives are loaded
      const urlParams = new URLSearchParams(window.location.search)
      const repIdParam = urlParams.get('rep')
      if (repIdParam && res.data) {
        // Verify the representative exists in the list
        const repExists = res.data.some(rep => rep.id === repIdParam)
        if (repExists) {
          // Set the selected representative
          setSelectedRep(repIdParam)
        }
        // Clear the URL parameter
        const url = new URL(window.location.href)
        url.searchParams.delete('rep')
        window.history.replaceState({}, '', url.toString())
      }
    })
    
    // Subscribe to all new messages to update unread counts
    const allMessagesChannel = supabase.channel('all-chat-messages')
    allMessagesChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload: any) => {
        const msg = payload.new as ChatMessage
        // If message is from representative and unread, refresh representatives list
        if (msg.sender_type === 'representative' && !msg.is_read) {
          refreshRepresentatives()
        }
      }
    )
    allMessagesChannel.subscribe()
    
    // Refresh representatives list every 30 seconds to update unread counts
    const interval = setInterval(() => {
      refreshRepresentatives()
    }, 30000) // 30 seconds
    
    return () => {
      clearInterval(interval)
      supabase.removeChannel(allMessagesChannel)
    }
  }, [])

  // Filter representatives based on search term while maintaining sort order
  const filteredRepresentatives = useMemo(() => {
    let filtered = representatives
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = representatives.filter(rep => 
        rep.name.toLowerCase().includes(search) ||
        rep.phone?.toLowerCase().includes(search) ||
        rep.id.toLowerCase().includes(search)
      )
    }
    
    // Maintain sort order: unread first, then by last message time, then alphabetically
    return filtered.sort((a, b) => {
      // First priority: unread count (higher first)
      if ((b.unread_count || 0) !== (a.unread_count || 0)) {
        return (b.unread_count || 0) - (a.unread_count || 0)
      }
      
      // Second priority: last message time (newer first)
      if (a.last_message_time && b.last_message_time) {
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      }
      if (a.last_message_time && !b.last_message_time) return -1
      if (!a.last_message_time && b.last_message_time) return 1
      
      // Third priority: alphabetical by name
      return a.name.localeCompare(b.name)
    })
  }, [representatives, searchTerm])

  // Fetch last location when representative is selected
  useEffect(() => {
    if (!selectedRep) {
      setLastLocation(null)
      return
    }
    
    setLoadingLocation(true)
    getLastLocationForRepresentative(selectedRep).then(res => {
      if (res.error) {
        console.error('Error fetching last location:', res.error)
        setLastLocation(null)
      } else {
        setLastLocation(res.data)
      }
      setLoadingLocation(false)
    })
    
    // Subscribe to location updates for this representative
    const locationChannel = supabase.channel(`location-updates-${selectedRep}`)
    locationChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'representative_live_locations',
        filter: `representative_id=eq.${selectedRep}`,
      },
      (payload: any) => {
        const newLocation = payload.new as RepresentativeLiveLocation
        setLastLocation(newLocation)
      }
    )
    locationChannel.subscribe()
    
    return () => {
      supabase.removeChannel(locationChannel)
    }
  }, [selectedRep])

  // Fetch messages and subscribe to realtime updates
  useEffect(() => {
    if (!selectedRep) {
      setMessages([])
      return
    }
    setLoading(true)
    setError(null)
    getChatMessages(selectedRep).then(res => {
      if (res.error) {
        setError(res.error)
        setMessages([])
      } else {
        // Messages are fetched in descending order (newest first), but we need ascending (oldest first) for display
        const messages = res.data || []
        // Sort by created_at ascending (oldest first) for proper chronological display
        const sortedMessages = [...messages].sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime()
          const timeB = new Date(b.created_at || 0).getTime()
          return timeA - timeB
        })
        setMessages(sortedMessages)
        // Mark messages as read when opening the chat
        markMessagesAsRead(selectedRep).then(() => {
          // Refresh representatives list to update unread counts
          refreshRepresentatives()
        })
      }
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
      (payload: any) => {
        const msg = payload.new as ChatMessage
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === msg.id)) return prev
          // Add new message and re-sort by created_at ascending
          const updated = [...prev, msg]
          return updated.sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime()
            const timeB = new Date(b.created_at || 0).getTime()
            return timeA - timeB
          })
        })
        // Mark as read if it's from admin (we just sent it)
        if (msg.sender_type === 'admin') {
          markMessagesAsRead(selectedRep).then(() => {
            refreshRepresentatives()
          })
        }
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
    
    const messageContent = newMessage.trim()
    setSending(true)
    
    // Optimistic update: Add message to UI immediately
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      representative_id: selectedRep,
      content: messageContent,
      sender_type: "admin",
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: null,
    }
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage("")
    inputRef.current?.focus()
    
    // Send message to server
    const res = await sendChatMessage({
      representative_id: selectedRep,
      content: messageContent,
      sender_type: "admin",
      message_type: "text",
    })
    
    setSending(false)
    
    if (!res.error && res.data) {
      // Replace optimistic message with real message from server
      // The real-time subscription should also catch this, but we handle it here as fallback
      setMessages(prev => {
        // Remove temp message
        const filtered = prev.filter(m => m.id !== tempId)
        // Check if real message already exists (from real-time subscription)
        const messageExists = filtered.some(m => m.id === res.data!.id)
        if (!messageExists) {
          // Add real message and sort chronologically
          const updated = [...filtered, res.data!]
          return updated.sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime()
            const timeB = new Date(b.created_at || 0).getTime()
            return timeA - timeB
          })
        }
        // If message already exists, just return filtered (real-time subscription already added it)
        return filtered
      })
      // Refresh representatives list to update last message time
      refreshRepresentatives()
    } else {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
      const errorMsg = res.error || 'Failed to send message'
      setError(errorMsg)
      console.error('Error sending message:', errorMsg)
      console.error('Message data that failed:', {
        representative_id: selectedRep,
        content: messageContent,
        sender_type: "admin",
        message_type: "text",
      })
      // Show error to user - you might want to use a toast notification here
      alert(isRTL ? `فشل إرسال الرسالة: ${errorMsg}` : `Failed to send message: ${errorMsg}`)
      // Restore message text so user can retry
      setNewMessage(messageContent)
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
      } else if (diffInMinutes < 30) {
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Online</Badge>
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

  const handleRequestLocation = () => {
    if (!selectedRep) return
    
    // Get the representative name
    const representative = representatives.find(r => r.id === selectedRep)
    if (!representative) return
    
    // Navigate to live map with the representative name for search/focus
    if (onNavigateToLiveMap) {
      onNavigateToLiveMap(representative.name)
    } else {
      // Fallback: use URL parameters and navigate manually
      const url = new URL(window.location.href)
      url.searchParams.set('tab', 'live-map')
      url.searchParams.set('search', representative.name)
      window.location.href = url.toString()
    }
  }

  const formatLocationTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) {
      return language === 'ar' ? 'الآن' : 'Just now'
    } else if (diffInMinutes < 60) {
      return language === 'ar' 
        ? `منذ ${Math.floor(diffInMinutes)} دقيقة` 
        : `${Math.floor(diffInMinutes)}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return language === 'ar' 
        ? `منذ ${hours} ساعة` 
        : `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return language === 'ar' 
        ? `منذ ${days} يوم` 
        : `${days}d ago`
    }
  }

  return (
    <div className="flex h-[75vh] bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Representatives Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              {language === 'ar' ? 'المندوبين' : 'Representatives'}
            </h3>
            {!repsLoading && (
              <Badge variant="secondary" className="text-xs">
                {filteredRepresentatives.length} {language === 'ar' ? 'مندوب' : 'reps'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'ar' ? 'اختر مندوب للبدء في المحادثة' : 'Select a representative to start chatting'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
            <Input
              type="text"
              placeholder={language === 'ar' ? 'بحث عن مندوب...' : 'Search representatives...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Representatives List */}
        <ScrollArea className="flex-1 overflow-y-auto max-h-[50vh] chat-scroll-container">
          {repsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : filteredRepresentatives.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'ar' ? searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد مندوبين' : searchTerm ? 'No search results' : 'No representatives available'}</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredRepresentatives.map(rep => (
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
                      {lastLocation && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-gray-600">
                            {language === 'ar' ? 'آخر موقع' : 'Last location'}: {formatLocationTime(lastLocation.timestamp)}
                          </span>
                        </Badge>
                      )}
                      {loadingLocation && (
                        <Badge variant="outline" className="text-xs">
                          <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lastLocation && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        // Open location in Google Maps
                        const url = `https://www.google.com/maps?q=${lastLocation.latitude},${lastLocation.longitude}`
                        window.open(url, '_blank')
                      }}
                      title={language === 'ar' ? 'عرض الموقع على الخريطة' : 'View location on map'}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRequestLocation}
                    title={language === 'ar' ? 'عرض الموقع على الخريطة' : 'View location on map'}
                    disabled={sending}
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
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
