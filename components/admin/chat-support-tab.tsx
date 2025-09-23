import { useEffect, useState, useRef } from "react"
import { getChatMessages, sendChatMessage, getChatRepresentatives } from "@/lib/representative-live-locations"
import { ChatMessage } from "@/types/representative-live-locations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ChatSupportTab() {
  const [representatives, setRepresentatives] = useState<{ id: string; name: string }[]>([])
  const [selectedRep, setSelectedRep] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [repsLoading, setRepsLoading] = useState(true)
  const subscriptionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

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
    }
  }

  return (
    <div className="flex gap-4 h-[70vh]">
      {/* Representatives list */}
      <div className="w-64 border-r bg-gray-50 p-2 overflow-y-auto">
        <h3 className="font-bold mb-2">Representatives</h3>
        {repsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
          </div>
        ) : representatives.length === 0 ? (
          <div className="text-gray-400">No representatives with messages.</div>
        ) : representatives.map(rep => (
          <Button
            key={rep.id}
            variant={selectedRep === rep.id ? "secondary" : "ghost"}
            className="w-full justify-start mb-1"
            onClick={() => setSelectedRep(rep.id)}
          >
            {rep.name}
          </Button>
        ))}
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Chat Support</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {!selectedRep ? (
              <div className="text-gray-500 flex-1 flex items-center justify-center">Select a representative to view messages.</div>
            ) : loading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-2">
                {messages.length === 0 ? (
                  <div className="text-gray-400 text-center">No messages yet.</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`max-w-[70%] rounded-lg px-3 py-2 mb-1 ${msg.sender_type === 'admin' ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'}`}>
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs text-gray-500 mt-1 text-right">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
            )}
            {/* Message input */}
            {selectedRep && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                  disabled={sending}
                />
                <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
                  Send
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
