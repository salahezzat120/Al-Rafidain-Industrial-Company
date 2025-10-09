"use client"

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Trophy, 
  Star, 
  Users, 
  TrendingUp, 
  Settings, 
  Plus,
  Gift,
  Award,
  Crown,
  Medal
} from 'lucide-react'
import {
  getAllCustomerLoyaltySummaries,
  getAllRepresentativeLoyaltySummaries,
  getCustomerLoyaltyLeaderboard,
  getRepresentativeLoyaltyLeaderboard,
  getLoyaltySettings,
  updateLoyaltySetting,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  getTierColor
} from '@/lib/simple-loyalty'
import type {
  CustomerLoyaltySummary,
  RepresentativeLoyaltySummary,
  LoyaltyLeaderboardEntry,
  LoyaltySettings,
  CreateLoyaltyTransaction
} from '@/types/simple-loyalty'

export default function SimpleLoyaltyTab() {
  const { t, isRTL } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Data states
  const [customerSummaries, setCustomerSummaries] = useState<CustomerLoyaltySummary[]>([])
  const [representativeSummaries, setRepresentativeSummaries] = useState<RepresentativeLoyaltySummary[]>([])
  const [customerLeaderboard, setCustomerLeaderboard] = useState<LoyaltyLeaderboardEntry[]>([])
  const [representativeLeaderboard, setRepresentativeLeaderboard] = useState<LoyaltyLeaderboardEntry[]>([])
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Dialog states
  const [addPointsOpen, setAddPointsOpen] = useState(false)
  const [redeemPointsOpen, setRedeemPointsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedRepresentative, setSelectedRepresentative] = useState('')
  const [pointsToAdd, setPointsToAdd] = useState('')
  const [pointsToRedeem, setPointsToRedeem] = useState('')
  const [transactionDescription, setTransactionDescription] = useState('')
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({})

  // Load all data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [
        customers,
        representatives,
        customerLeaderboardData,
        representativeLeaderboardData,
        settings
      ] = await Promise.all([
        getAllCustomerLoyaltySummaries(),
        getAllRepresentativeLoyaltySummaries(),
        getCustomerLoyaltyLeaderboard(10),
        getRepresentativeLoyaltyLeaderboard(10),
        getLoyaltySettings()
      ])

      setCustomerSummaries(customers)
      setRepresentativeSummaries(representatives)
      setCustomerLeaderboard(customerLeaderboardData)
      setRepresentativeLeaderboard(representativeLeaderboardData)
      setLoyaltySettings(settings)
      
      // Initialize settings form
      const settingsObj: Record<string, string> = {}
      settings.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value
      })
      setSettingsForm(settingsObj)
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPoints = async () => {
    if (!selectedCustomer && !selectedRepresentative) return
    if (!pointsToAdd || parseInt(pointsToAdd) <= 0) return

    setSubmitting(true)
    try {
      const transaction: CreateLoyaltyTransaction = {
        customer_id: selectedCustomer || undefined,
        representative_id: selectedRepresentative || undefined,
        transaction_type: 'admin_adjustment',
        points: parseInt(pointsToAdd),
        description: transactionDescription || `Admin added ${pointsToAdd} points`
      }

      await addLoyaltyPoints(transaction)
      await loadAllData()
      
      setAddPointsOpen(false)
      setSelectedCustomer('')
      setSelectedRepresentative('')
      setPointsToAdd('')
      setTransactionDescription('')
    } catch (error) {
      console.error('Error adding points:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRedeemPoints = async () => {
    if (!selectedCustomer) return
    if (!pointsToRedeem || parseInt(pointsToRedeem) <= 0) return

    setSubmitting(true)
    try {
      await redeemLoyaltyPoints(selectedCustomer, parseInt(pointsToRedeem), transactionDescription)
      await loadAllData()
      
      setRedeemPointsOpen(false)
      setSelectedCustomer('')
      setPointsToRedeem('')
      setTransactionDescription('')
    } catch (error) {
      console.error('Error redeeming points:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSettings = async () => {
    setSubmitting(true)
    try {
      for (const [key, value] of Object.entries(settingsForm)) {
        // Find the setting description from the loaded settings
        const setting = loyaltySettings.find(s => s.setting_key === key)
        const description = setting?.description || ''
        await updateLoyaltySetting(key, value, description)
      }
      await loadAllData()
      setSettingsOpen(false)
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return <Crown className="h-4 w-4 text-purple-600" />
      case 'Gold': return <Trophy className="h-4 w-4 text-yellow-600" />
      case 'Silver': return <Medal className="h-4 w-4 text-gray-600" />
      case 'Bronze': return <Award className="h-4 w-4 text-orange-600" />
      default: return <Star className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? "نظام الولاء" : "Loyalty System"}
          </h2>
          <p className="text-gray-600">
            {isRTL ? "إدارة نقاط الولاء للعملاء والمندوبين" : "Manage loyalty points for customers and representatives"}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addPointsOpen} onOpenChange={setAddPointsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? "إضافة نقاط" : "Add Points"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isRTL ? "إضافة نقاط الولاء" : "Add Loyalty Points"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{isRTL ? "اختر العميل" : "Select Customer"}</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? "اختر عميل" : "Select customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customerSummaries.map(customer => (
                        <SelectItem key={customer.customer_id} value={customer.customer_id}>
                          {customer.customer_name} ({customer.customer_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? "اختر المندوب" : "Select Representative"}</Label>
                  <Select value={selectedRepresentative} onValueChange={setSelectedRepresentative}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? "اختر مندوب" : "Select representative"} />
                    </SelectTrigger>
                    <SelectContent>
                      {representativeSummaries.map(rep => (
                        <SelectItem key={rep.representative_id} value={rep.representative_id}>
                          {rep.representative_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? "عدد النقاط" : "Points"}</Label>
                  <Input
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(e.target.value)}
                    placeholder={isRTL ? "أدخل عدد النقاط" : "Enter points"}
                  />
                </div>
                <div>
                  <Label>{isRTL ? "الوصف" : "Description"}</Label>
                  <Textarea
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    placeholder={isRTL ? "وصف المعاملة" : "Transaction description"}
                  />
                </div>
                <Button onClick={handleAddPoints} disabled={submitting} className="w-full">
                  {submitting ? (isRTL ? "جاري الإضافة..." : "Adding...") : (isRTL ? "إضافة النقاط" : "Add Points")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                {isRTL ? "الإعدادات" : "Settings"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isRTL ? "إعدادات نظام الولاء" : "Loyalty System Settings"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {loyaltySettings.map(setting => (
                  <div key={setting.id}>
                    <Label>{setting.description || setting.setting_key}</Label>
                    <Input
                      value={settingsForm[setting.setting_key] || ''}
                      onChange={(e) => setSettingsForm(prev => ({
                        ...prev,
                        [setting.setting_key]: e.target.value
                      }))}
                    />
                  </div>
                ))}
                <Button onClick={handleUpdateSettings} disabled={submitting} className="w-full">
                  {submitting ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ الإعدادات" : "Save Settings")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي العملاء" : "Total Customers"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              {customerSummaries.filter(c => c.current_points > 0).length} {isRTL ? "لديهم نقاط" : "with points"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي المندوبين" : "Total Representatives"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{representativeSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              {representativeSummaries.filter(r => r.current_points > 0).length} {isRTL ? "لديهم نقاط" : "with points"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي النقاط" : "Total Points"}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerSummaries.reduce((sum, c) => sum + c.current_points, 0) + 
               representativeSummaries.reduce((sum, r) => sum + r.current_points, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "نقاط نشطة" : "active points"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isRTL ? "أعلى عميل" : "Top Customer"}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerLeaderboard[0]?.current_points || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {customerLeaderboard[0]?.customer_name || (isRTL ? "لا يوجد" : "None")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{isRTL ? "نظرة عامة" : "Overview"}</TabsTrigger>
          <TabsTrigger value="customers">{isRTL ? "العملاء" : "Customers"}</TabsTrigger>
          <TabsTrigger value="representatives">{isRTL ? "المندوبين" : "Representatives"}</TabsTrigger>
          <TabsTrigger value="leaderboard">{isRTL ? "لوحة المتصدرين" : "Leaderboard"}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {isRTL ? "أفضل العملاء" : "Top Customers"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customerLeaderboard.slice(0, 5).map((customer, index) => (
                    <div key={customer.customer_id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{customer.customer_name}</span>
                        {getTierIcon(customer.loyalty_tier)}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{customer.current_points}</div>
                        <div className="text-xs text-gray-500">{isRTL ? "نقطة" : "points"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Representative Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {isRTL ? "أفضل المندوبين" : "Top Representatives"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {representativeLeaderboard.slice(0, 5).map((rep, index) => (
                    <div key={rep.representative_id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{rep.representative_name}</span>
                        {getTierIcon(rep.loyalty_tier)}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{rep.current_points}</div>
                        <div className="text-xs text-gray-500">{isRTL ? "نقطة" : "points"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "جميع العملاء" : "All Customers"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "العميل" : "Customer"}</TableHead>
                    <TableHead>{isRTL ? "النقاط الحالية" : "Current Points"}</TableHead>
                    <TableHead>{isRTL ? "إجمالي المكتسب" : "Total Earned"}</TableHead>
                    <TableHead>{isRTL ? "المستوى" : "Tier"}</TableHead>
                    <TableHead>{isRTL ? "آخر نشاط" : "Last Activity"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerSummaries.map(customer => (
                    <TableRow key={customer.customer_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.customer_name}</div>
                          <div className="text-sm text-gray-500">{customer.customer_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          {customer.current_points}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.total_earned}</TableCell>
                      <TableCell>
                        <Badge className={getTierColor(customer.loyalty_tier)}>
                          {getTierIcon(customer.loyalty_tier)}
                          <span className="ml-1">{customer.loyalty_tier}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.last_activity_date ? new Date(customer.last_activity_date).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="representatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "جميع المندوبين" : "All Representatives"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "المندوب" : "Representative"}</TableHead>
                    <TableHead>{isRTL ? "النقاط الحالية" : "Current Points"}</TableHead>
                    <TableHead>{isRTL ? "إجمالي المكتسب" : "Total Earned"}</TableHead>
                    <TableHead>{isRTL ? "المستوى" : "Tier"}</TableHead>
                    <TableHead>{isRTL ? "آخر نشاط" : "Last Activity"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {representativeSummaries.map(rep => (
                    <TableRow key={rep.representative_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rep.representative_name}</div>
                          <div className="text-sm text-gray-500">{rep.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          {rep.current_points}
                        </Badge>
                      </TableCell>
                      <TableCell>{rep.total_earned}</TableCell>
                      <TableCell>
                        <Badge className={getTierColor(rep.loyalty_tier)}>
                          {getTierIcon(rep.loyalty_tier)}
                          <span className="ml-1">{rep.loyalty_tier}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rep.last_activity_date ? new Date(rep.last_activity_date).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {isRTL ? "لوحة المتصدرين - العملاء" : "Customer Leaderboard"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerLeaderboard.map((customer, index) => (
                    <div key={customer.customer_id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{customer.customer_name}</div>
                          <div className="text-sm text-gray-500">{customer.customer_code}</div>
                        </div>
                        <Badge className={getTierColor(customer.loyalty_tier)}>
                          {getTierIcon(customer.loyalty_tier)}
                          <span className="ml-1">{customer.loyalty_tier}</span>
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{customer.current_points}</div>
                        <div className="text-sm text-gray-500">{isRTL ? "نقطة" : "points"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {isRTL ? "لوحة المتصدرين - المندوبين" : "Representative Leaderboard"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {representativeLeaderboard.map((rep, index) => (
                    <div key={rep.representative_id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{rep.representative_name}</div>
                          <div className="text-sm text-gray-500">{rep.representative_id}</div>
                        </div>
                        <Badge className={getTierColor(rep.loyalty_tier)}>
                          {getTierIcon(rep.loyalty_tier)}
                          <span className="ml-1">{rep.loyalty_tier}</span>
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{rep.current_points}</div>
                        <div className="text-sm text-gray-500">{isRTL ? "نقطة" : "points"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
