"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Paperclip,
  Smile,
  Image,
  FileText,
  Video,
  Mic,
  Search,
  Filter,
  RefreshCw,
  Star,
  Reply,
  Forward,
  Archive,
  Trash2,
  Edit,
  Copy,
  Download
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId?: string
  recipientName?: string
  recipientEmail?: string
  messageType?: 'email' | 'sms' | 'whatsapp' | 'internal'
}

interface Message {
  id: string
  type: 'email' | 'sms' | 'whatsapp' | 'internal'
  recipient: {
    id: string
    name: string
    email: string
    phone?: string
  }
  subject?: string
  content: string
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  sentAt?: string
  readAt?: string
  attachments?: Attachment[]
  template?: string
  isReply?: boolean
  replyTo?: string
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

interface MessageTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'sms' | 'whatsapp'
  category: string
}

export function SendMessageModal({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName, 
  recipientEmail,
  messageType = 'email'
}: SendMessageModalProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("compose")
  const [loading, setLoading] = useState(false)
  
  // Message data
  const [messages, setMessages] = useState<Message[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  
  // New message form
  const [newMessage, setNewMessage] = useState({
    type: messageType,
    recipientId: recipientId || '',
    recipientName: recipientName || '',
    recipientEmail: recipientEmail || '',
    recipientPhone: '',
    subject: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    template: '',
    attachments: [] as Attachment[]
  })
  
  // Message history
  const [messageHistory, setMessageHistory] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  
  // UI state
  const [isSending, setIsSending] = useState(false)
  const [isReply, setIsReply] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (isOpen) {
      loadMessages()
      loadTemplates()
      loadMessageHistory()
    }
  }, [isOpen])

  const loadMessages = async () => {
    setLoading(true)
    try {
      // Mock messages data
      const mockMessages: Message[] = [
        {
          id: "msg_001",
          type: "email",
          recipient: {
            id: "customer_001",
            name: "أحمد محمد",
            email: "ahmed.mohamed@email.com",
            phone: "+966501234567"
          },
          subject: "تأكيد الطلب",
          content: "شكراً لكم على طلبكم. تم تأكيد الطلب وسيتم الشحن خلال 24 ساعة.",
          status: "sent",
          priority: "normal",
          sentAt: "2024-01-15T10:30:00Z",
          readAt: "2024-01-15T11:15:00Z"
        },
        {
          id: "msg_002",
          type: "sms",
          recipient: {
            id: "customer_002",
            name: "سارة أحمد",
            email: "sara.ahmed@email.com",
            phone: "+966501234568"
          },
          content: "تم تحديث حالة طلبكم. يمكنكم تتبع الطلب عبر الرابط: https://track.example.com/12345",
          status: "delivered",
          priority: "high",
          sentAt: "2024-01-15T14:20:00Z"
        },
        {
          id: "msg_003",
          type: "whatsapp",
          recipient: {
            id: "customer_003",
            name: "خالد عبدالرحمن",
            email: "khalid.abdulrahman@email.com",
            phone: "+966501234569"
          },
          content: "مرحباً! نود أن نعلمكم أن منتجكم جاهز للاستلام. يرجى التواصل معنا لترتيب الاستلام.",
          status: "read",
          priority: "normal",
          sentAt: "2024-01-15T16:45:00Z",
          readAt: "2024-01-15T17:00:00Z"
        }
      ]
      
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      // Mock templates data
      const mockTemplates: MessageTemplate[] = [
        {
          id: "template_001",
          name: "تأكيد الطلب",
          subject: "تأكيد استلام طلبكم",
          content: "شكراً لكم على طلبكم رقم {order_number}. تم تأكيد الطلب وسيتم الشحن خلال {shipping_time}.",
          type: "email",
          category: "orders"
        },
        {
          id: "template_002",
          name: "تحديث حالة الشحن",
          subject: "تحديث حالة شحن طلبكم",
          content: "تم تحديث حالة شحن طلبكم رقم {order_number}. يمكنكم تتبع الطلب عبر الرابط: {tracking_link}",
          type: "sms",
          category: "shipping"
        },
        {
          id: "template_003",
          name: "استطلاع رضا العملاء",
          subject: "استطلاع رضا العملاء",
          content: "نود أن نعلم رأيكم في خدمتنا. يرجى تقييم تجربتكم معنا: {rating_link}",
          type: "whatsapp",
          category: "feedback"
        },
        {
          id: "template_004",
          name: "تذكير بالموعد",
          subject: "تذكير بموعد الصيانة",
          content: "نذكركم بموعد الصيانة المجدول لجهازكم في {appointment_date} في تمام الساعة {appointment_time}.",
          type: "email",
          category: "maintenance"
        }
      ]
      
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadMessageHistory = async () => {
    try {
      // Mock message history data
      const mockHistory: Message[] = [
        {
          id: "hist_001",
          type: "email",
          recipient: {
            id: "customer_001",
            name: "أحمد محمد",
            email: "ahmed.mohamed@email.com"
          },
          subject: "رد على استفسار حول المنتج",
          content: "شكراً لاستفساركم. المنتج متوفر حالياً ويمكنكم الطلب عبر موقعنا الإلكتروني.",
          status: "sent",
          priority: "normal",
          sentAt: "2024-01-14T09:15:00Z",
          isReply: true
        },
        {
          id: "hist_002",
          type: "sms",
          recipient: {
            id: "customer_002",
            name: "سارة أحمد",
            email: "sara.ahmed@email.com",
            phone: "+966501234568"
          },
          content: "تم تأكيد موعد الصيانة لجهازكم في 20 يناير 2024 الساعة 10:00 صباحاً.",
          status: "delivered",
          priority: "high",
          sentAt: "2024-01-13T15:30:00Z"
        }
      ]
      
      setMessageHistory(mockHistory)
    } catch (error) {
      console.error('Error loading message history:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) {
      alert('يرجى إدخال محتوى الرسالة')
      return
    }

    setIsSending(true)
    try {
      const message: Message = {
        id: `msg_${Date.now()}`,
        type: newMessage.type,
        recipient: {
          id: newMessage.recipientId,
          name: newMessage.recipientName,
          email: newMessage.recipientEmail,
          phone: newMessage.recipientPhone
        },
        subject: newMessage.subject,
        content: newMessage.content,
        status: 'sent',
        priority: newMessage.priority,
        sentAt: new Date().toISOString(),
        attachments: newMessage.attachments,
        isReply: isReply,
        replyTo: replyToMessage?.id
      }

      // Add to messages list
      setMessages(prev => [message, ...prev])
      setMessageHistory(prev => [message, ...prev])

      // Reset form
      setNewMessage({
        type: messageType,
        recipientId: recipientId || '',
        recipientName: recipientName || '',
        recipientEmail: recipientEmail || '',
        recipientPhone: '',
        subject: '',
        content: '',
        priority: 'normal',
        template: '',
        attachments: []
      })
      setIsReply(false)
      setReplyToMessage(null)

      alert('تم إرسال الرسالة بنجاح!')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('حدث خطأ أثناء إرسال الرسالة')
    } finally {
      setIsSending(false)
    }
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setNewMessage(prev => ({
      ...prev,
      type: template.type,
      subject: template.subject,
      content: template.content
    }))
  }

  const handleReply = (message: Message) => {
    setReplyToMessage(message)
    setIsReply(true)
    setNewMessage(prev => ({
      ...prev,
      recipientId: message.recipient.id,
      recipientName: message.recipient.name,
      recipientEmail: message.recipient.email,
      recipientPhone: message.recipient.phone,
      subject: `رد على: ${message.subject || 'رسالة'}`,
      content: `\n\n---\nالرسالة الأصلية:\n${message.content}`
    }))
    setActiveTab("compose")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return "bg-blue-100 text-blue-800"
      case 'delivered':
        return "bg-green-100 text-green-800"
      case 'read':
        return "bg-purple-100 text-purple-800"
      case 'failed':
        return "bg-red-100 text-red-800"
      case 'draft':
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return "bg-red-100 text-red-800"
      case 'high':
        return "bg-orange-100 text-orange-800"
      case 'normal':
        return "bg-blue-100 text-blue-800"
      case 'low':
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'sms':
        return <MessageSquare className="h-4 w-4" />
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />
      case 'internal':
        return <User className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    const diffInDays = Math.floor(diffInHours / 24)
    return `منذ ${diffInDays} يوم`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6" />
            <span>إرسال الرسائل</span>
          </DialogTitle>
          <DialogDescription>
            إرسال رسائل للعملاء عبر البريد الإلكتروني، الرسائل النصية، وواتساب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="compose">كتابة رسالة</TabsTrigger>
              <TabsTrigger value="templates">القوالب</TabsTrigger>
              <TabsTrigger value="history">التاريخ</TabsTrigger>
              <TabsTrigger value="sent">المرسل</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>كتابة رسالة جديدة</CardTitle>
                  <CardDescription>
                    {isReply && replyToMessage && `رد على رسالة من ${replyToMessage.recipient.name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="message-type">نوع الرسالة</Label>
                      <Select 
                        value={newMessage.type} 
                        onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">بريد إلكتروني</SelectItem>
                          <SelectItem value="sms">رسالة نصية</SelectItem>
                          <SelectItem value="whatsapp">واتساب</SelectItem>
                          <SelectItem value="internal">داخلي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">الأولوية</Label>
                      <Select 
                        value={newMessage.priority} 
                        onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">منخفضة</SelectItem>
                          <SelectItem value="normal">عادية</SelectItem>
                          <SelectItem value="high">عالية</SelectItem>
                          <SelectItem value="urgent">عاجلة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient-name">اسم المستلم *</Label>
                      <Input
                        id="recipient-name"
                        value={newMessage.recipientName}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, recipientName: e.target.value }))}
                        placeholder="اسم المستلم"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient-email">البريد الإلكتروني</Label>
                      <Input
                        id="recipient-email"
                        type="email"
                        value={newMessage.recipientEmail}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, recipientEmail: e.target.value }))}
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  {(newMessage.type === 'sms' || newMessage.type === 'whatsapp') && (
                    <div className="space-y-2">
                      <Label htmlFor="recipient-phone">رقم الهاتف *</Label>
                      <Input
                        id="recipient-phone"
                        value={newMessage.recipientPhone}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, recipientPhone: e.target.value }))}
                        placeholder="+966501234567"
                      />
                    </div>
                  )}

                  {newMessage.type === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="subject">الموضوع</Label>
                      <Input
                        id="subject"
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="موضوع الرسالة"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="content">محتوى الرسالة *</Label>
                    <Textarea
                      id="content"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        إرفاق ملف
                      </Button>
                      <Button variant="outline" size="sm">
                        <Image className="h-4 w-4 mr-2" />
                        صورة
                      </Button>
                      <Button variant="outline" size="sm">
                        <Smile className="h-4 w-4 mr-2" />
                        إيموجي
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isReply && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsReply(false)
                            setReplyToMessage(null)
                          }}
                        >
                          إلغاء الرد
                        </Button>
                      )}
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.content.trim()}
                      >
                        {isSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>قوالب الرسائل</CardTitle>
                  <CardDescription>
                    اختر من القوالب الجاهزة أو أنشئ قالب جديد
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline">
                            {template.type === 'email' ? 'بريد إلكتروني' :
                             template.type === 'sms' ? 'رسالة نصية' : 'واتساب'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{template.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{template.category}</span>
                          <Button variant="outline" size="sm">
                            استخدام
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="البحث في الرسائل..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="sent">مرسل</SelectItem>
                      <SelectItem value="delivered">تم التسليم</SelectItem>
                      <SelectItem value="read">مقروء</SelectItem>
                      <SelectItem value="failed">فشل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث
                </Button>
              </div>

              <div className="space-y-4">
                {messageHistory.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد رسائل</h3>
                      <p className="text-gray-500">لم يتم إرسال أي رسائل بعد</p>
                    </CardContent>
                  </Card>
                ) : (
                  messageHistory.map((message) => (
                    <Card key={message.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(message.type)}
                              <h4 className="font-medium">
                                {message.subject || 'رسالة بدون موضوع'}
                              </h4>
                              <Badge className={getStatusColor(message.status)}>
                                {message.status === 'sent' ? 'مرسل' :
                                 message.status === 'delivered' ? 'تم التسليم' :
                                 message.status === 'read' ? 'مقروء' :
                                 message.status === 'failed' ? 'فشل' : 'مسودة'}
                              </Badge>
                              <Badge className={getPriorityColor(message.priority)}>
                                {message.priority === 'urgent' ? 'عاجل' :
                                 message.priority === 'high' ? 'عالي' :
                                 message.priority === 'normal' ? 'عادي' : 'منخفض'}
                              </Badge>
                              {message.isReply && (
                                <Badge variant="outline">رد</Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>إلى: {message.recipient.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatTimeAgo(message.sentAt || '')}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 line-clamp-2 mb-2">{message.content}</p>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Paperclip className="h-3 w-3" />
                                <span>{message.attachments.length} مرفق</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReply(message)}
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Forward className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد رسائل مرسلة</h3>
                      <p className="text-gray-500">لم يتم إرسال أي رسائل بعد</p>
                    </CardContent>
                  </Card>
                ) : (
                  messages.map((message) => (
                    <Card key={message.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(message.type)}
                              <h4 className="font-medium">
                                {message.subject || 'رسالة بدون موضوع'}
                              </h4>
                              <Badge className={getStatusColor(message.status)}>
                                {message.status === 'sent' ? 'مرسل' :
                                 message.status === 'delivered' ? 'تم التسليم' :
                                 message.status === 'read' ? 'مقروء' :
                                 message.status === 'failed' ? 'فشل' : 'مسودة'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>إلى: {message.recipient.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatTimeAgo(message.sentAt || '')}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 line-clamp-2">{message.content}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
