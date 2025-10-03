"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Users, Shield, Database, Bell, Globe, Save, RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SettingsTab() {
  const { t } = useLanguage()

  // State management
  const [settings, setSettings] = useState({
    companyName: "Al-Rafidain Industrial Company",
    companyEmail: "admin@alrafidain.com",
    companyPhone: "+1 (555) 123-4567",
    companyAddress: "123 Business St, City, State 12345",
    timezone: "America/New_York",
    currency: "USD",
    language: "en",
    autoAssignTasks: true,
    realTimeTracking: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dataRetention: "12",
    backupFrequency: "daily",
    workingHours: { start: "09:00", end: "17:00" },
    customerTypes: ['active', 'vip', 'inactive'],
    coverageZones: ['Downtown', 'North Zone', 'East District'],
    selectedCustomerType: 'active',
    selectedCoverageZone: 'Downtown',
  })

  const [originalSettings, setOriginalSettings] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings))
  }, [settings, originalSettings])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // Try to load from localStorage first
      const savedSettings = localStorage.getItem('system-settings')
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(parsedSettings)
        setOriginalSettings(parsedSettings)
      } else {
        // Use default settings
        setOriginalSettings(settings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setOriginalSettings(settings)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // Save to localStorage
      localStorage.setItem('system-settings', JSON.stringify(settings))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOriginalSettings(settings)
      setHasChanges(false)
      setSaveStatus('success')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    const defaultSettings = {
      companyName: "Al-Rafidain Industrial Company",
      companyEmail: "admin@alrafidain.com",
      companyPhone: "+1 (555) 123-4567",
      companyAddress: "123 Business St, City, State 12345",
      timezone: "America/New_York",
      currency: "USD",
      language: "en",
      autoAssignTasks: true,
      realTimeTracking: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      dataRetention: "12",
      backupFrequency: "daily",
      workingHours: { start: "09:00", end: "17:00" },
      customerTypes: ['active', 'vip', 'inactive'],
      coverageZones: ['Downtown', 'North Zone', 'East District'],
      selectedCustomerType: 'active',
      selectedCoverageZone: 'Downtown',
    }
    
    setSettings(defaultSettings)
    setSaveStatus('idle')
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("systemSettings")}</h2>
        <p className="text-gray-600">{t("configureSystemPreferences")}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t("general")}</TabsTrigger>
          <TabsTrigger value="users">{t("userManagement")}</TabsTrigger>
          <TabsTrigger value="security">{t("security")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("integrations")}</TabsTrigger>
          <TabsTrigger value="backup">{t("backupData")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t("companyInformation")}
                </CardTitle>
                <CardDescription>{t("companyInformationDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">{t("companyName")}</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange("companyName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">{t("companyEmail")}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleSettingChange("companyEmail", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">{t("phoneNumber")}</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) => handleSettingChange("companyPhone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">{t("address")}</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) => handleSettingChange("companyAddress", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  {t("systemPreferences")}
                </CardTitle>
                <CardDescription>{t("systemPreferencesDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">{t("timezone")}</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">{t("currency")}</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">{t("language")}</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoAssign">{t("autoAssignTasks")}</Label>
                      <p className="text-sm text-gray-500">{t("autoAssignTasksDescription")}</p>
                    </div>
                    <Switch
                      id="autoAssign"
                      checked={settings.autoAssignTasks}
                      onCheckedChange={(checked) => handleSettingChange("autoAssignTasks", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="realTimeTracking">{t("realTimeTracking")}</Label>
                      <p className="text-sm text-gray-500">{t("realTimeTrackingDescription")}</p>
                    </div>
                    <Switch
                      id="realTimeTracking"
                      checked={settings.realTimeTracking}
                      onCheckedChange={(checked) => handleSettingChange("realTimeTracking", checked)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="workingHours">{t("workingHours")}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="workingHoursStart"
                      value={settings.workingHours.start}
                      onChange={(e) => handleSettingChange("workingHours", { ...settings.workingHours, start: e.target.value })}
                      placeholder="Start Time"
                    />
                    <Input
                      id="workingHoursEnd"
                      value={settings.workingHours.end}
                      onChange={(e) => handleSettingChange("workingHours", { ...settings.workingHours, end: e.target.value })}
                      placeholder="End Time"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerTypes">{t("customerTypes")}</Label>
                  <Select
                    value={settings.selectedCustomerType}
                    onValueChange={(value) => handleSettingChange("selectedCustomerType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.customerTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="coverageZones">{t("coverageZones")}</Label>
                  <Select
                    value={settings.selectedCoverageZone}
                    onValueChange={(value) => handleSettingChange("selectedCoverageZone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.coverageZones.map((zone) => (
                        <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                {t("notificationSettings")}
              </CardTitle>
              <CardDescription>{t("notificationSettingsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">{t("emailNotifications")}</Label>
                    <p className="text-sm text-gray-500">{t("emailNotificationsDescription")}</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">{t("smsNotifications")}</Label>
                    <p className="text-sm text-gray-500">{t("smsNotificationsDescription")}</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">{t("pushNotifications")}</Label>
                    <p className="text-sm text-gray-500">{t("pushNotificationsDescription")}</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {saveStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Settings saved successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {saveStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to save settings. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={resetToDefaults}
                disabled={isSaving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("resetToDefaults")}
              </Button>
              <Button 
                onClick={saveSettings}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Saving..." : t("saveChanges")}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {t("userManagement")}
              </CardTitle>
              <CardDescription>{t("userManagementDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-gray-500">admin@alrafidain.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Admin</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Supervisor</p>
                      <p className="text-sm text-gray-500">supervisor@alrafidain.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Supervisor</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Representative</p>
                      <p className="text-sm text-gray-500">rep@alrafidain.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Representative</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>

              {/* Add User Button */}
              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t("securitySettings")}
              </CardTitle>
              <CardDescription>{t("securitySettingsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Policy */}
              <div className="space-y-4">
                <h4 className="font-medium">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                    <Input
                      id="minPasswordLength"
                      type="number"
                      defaultValue="8"
                      min="6"
                      max="32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      defaultValue="90"
                      min="30"
                      max="365"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="requireUppercase" defaultChecked />
                    <Label htmlFor="requireUppercase">Require uppercase letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="requireNumbers" defaultChecked />
                    <Label htmlFor="requireNumbers">Require numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="requireSymbols" />
                    <Label htmlFor="requireSymbols">Require special characters</Label>
                  </div>
                </div>
              </div>

              {/* Session Management */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Session Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      defaultValue="30"
                      min="5"
                      max="480"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      defaultValue="5"
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="lockoutEnabled" defaultChecked />
                  <Label htmlFor="lockoutEnabled">Enable account lockout after failed attempts</Label>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorEnabled">Enable 2FA</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch id="twoFactorEnabled" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms2FA">SMS Authentication</Label>
                    <p className="text-sm text-gray-500">Use SMS for 2FA</p>
                  </div>
                  <Switch id="sms2FA" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email2FA">Email Authentication</Label>
                    <p className="text-sm text-gray-500">Use email for 2FA</p>
                  </div>
                  <Switch id="email2FA" defaultChecked />
                </div>
              </div>

              {/* Security Actions */}
              <div className="pt-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Force Password Reset
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Revoke All Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("thirdPartyIntegrations")}</CardTitle>
              <CardDescription>{t("thirdPartyIntegrationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Integration */}
              <div className="space-y-4">
                <h4 className="font-medium">Email Integration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" type="number" placeholder="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input id="smtpUser" placeholder="your-email@gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtpPass">SMTP Password</Label>
                    <Input id="smtpPass" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="emailEnabled" />
                  <Label htmlFor="emailEnabled">Enable email notifications</Label>
                </div>
              </div>

              {/* SMS Integration */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">SMS Integration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smsProvider">SMS Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="aws">AWS SNS</SelectItem>
                        <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="smsApiKey">API Key</Label>
                    <Input id="smsApiKey" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="smsEnabled" />
                  <Label htmlFor="smsEnabled">Enable SMS notifications</Label>
                </div>
              </div>

              {/* Database Integration */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Database Integration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="supabaseEnabled">Supabase</Label>
                      <p className="text-sm text-gray-500">Real-time database</p>
                    </div>
                    <Switch id="supabaseEnabled" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backupEnabled">Auto Backup</Label>
                      <p className="text-sm text-gray-500">Automatic database backups</p>
                    </div>
                    <Switch id="backupEnabled" defaultChecked />
                  </div>
                </div>
              </div>

              {/* API Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">API Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiRateLimit">Rate Limit (requests/hour)</Label>
                    <Input id="apiRateLimit" type="number" defaultValue="1000" />
                  </div>
                  <div>
                    <Label htmlFor="apiTimeout">Timeout (seconds)</Label>
                    <Input id="apiTimeout" type="number" defaultValue="30" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="apiEnabled" defaultChecked />
                  <Label htmlFor="apiEnabled">Enable API access</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                {t("backupDataManagement")}
              </CardTitle>
              <CardDescription>{t("backupDataManagementDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Backup Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dataRetention">
                    {t("dataRetention")} ({t("months")})
                  </Label>
                  <Select
                    value={settings.dataRetention}
                    onValueChange={(value) => handleSettingChange("dataRetention", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 {t("months")}</SelectItem>
                      <SelectItem value="12">12 {t("months")}</SelectItem>
                      <SelectItem value="24">24 {t("months")}</SelectItem>
                      <SelectItem value="36">36 {t("months")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backupFrequency">{t("backupFrequency")}</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => handleSettingChange("backupFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t("daily")}</SelectItem>
                      <SelectItem value="weekly">{t("weekly")}</SelectItem>
                      <SelectItem value="monthly">{t("monthly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Backup Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{t("lastBackup")}</h4>
                    <p className="text-sm text-gray-500">January 15, 2024 at 2:30 AM</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Database className="h-4 w-4 mr-2" />
                      {t("createBackupNow")}
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>

                {/* Backup History */}
                <div className="space-y-2">
                  <h5 className="font-medium">Backup History</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <span className="text-sm">backup_2024_01_15_023000.sql</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">2.3 MB</span>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <span className="text-sm">backup_2024_01_14_023000.sql</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">2.1 MB</span>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <span className="text-sm">backup_2024_01_13_023000.sql</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">2.0 MB</span>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Information */}
              <div className="pt-4 border-t">
                <h5 className="font-medium mb-2">Storage Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">15.2 GB</div>
                    <div className="text-sm text-gray-500">Total Used</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">84.8 GB</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">100 GB</div>
                    <div className="text-sm text-gray-500">Total Storage</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
