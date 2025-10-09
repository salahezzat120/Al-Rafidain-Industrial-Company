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
import { Settings, Users, Database, Bell, Globe, Save, RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UsersTab } from "@/components/admin/users-tab"
import { 
  createBackup, 
  getBackupHistory, 
  downloadBackup, 
  restoreBackup, 
  deleteBackup,
  getStorageInfo,
  formatFileSize,
  getBackupSettings,
  saveBackupSettings,
  scheduleBackup,
  cancelScheduledBackup,
  type BackupInfo,
  type BackupSettings,
  type StorageInfo
} from "@/lib/backup"

export function SettingsTab() {
  const { t } = useLanguage()

  // State management
  const [settings, setSettings] = useState({
    companyName: "Al-Rafidain Industrial Company",
    companyEmail: "admin@alrafidain.com",
    companyPhone: "+966 11 123 4567",
    companyAddress: "King Fahd Road, Riyadh 12345, Saudi Arabia",
    timezone: "Asia/Riyadh",
    currency: "SAR",
    language: "ar",
    autoAssignTasks: true,
    realTimeTracking: true,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    dataRetention: "12",
    backupFrequency: "daily",
    workingHours: { start: "08:00", end: "17:00" },
    customerTypes: ['active', 'vip', 'inactive'],
    coverageZones: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    selectedCustomerType: 'active',
    selectedCoverageZone: 'Riyadh',
  })

  const [originalSettings, setOriginalSettings] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [hasChanges, setHasChanges] = useState(false)
  
  // Backup-related state
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ totalUsed: 0, available: 0, totalStorage: 0 })
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({ frequency: 'daily', retention: 12, autoBackup: false })
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
    loadBackupData()
  }, [])

  // Load backup data
  const loadBackupData = () => {
    try {
      const backupHistory = getBackupHistory()
      const storage = getStorageInfo()
      const settings = getBackupSettings()
      
      setBackups(backupHistory)
      setStorageInfo(storage)
      setBackupSettings(settings)
    } catch (error) {
      console.error('Error loading backup data:', error)
    }
  }

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
      companyPhone: "+966 11 123 4567",
      companyAddress: "King Fahd Road, Riyadh 12345, Saudi Arabia",
      timezone: "Asia/Riyadh",
      currency: "SAR",
      language: "ar",
      autoAssignTasks: true,
      realTimeTracking: true,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      dataRetention: "12",
      backupFrequency: "daily",
      workingHours: { start: "08:00", end: "17:00" },
      customerTypes: ['active', 'vip', 'inactive'],
      coverageZones: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
      selectedCustomerType: 'active',
      selectedCoverageZone: 'Riyadh',
    }
    
    setSettings(defaultSettings)
    setSaveStatus('idle')
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // Backup operations
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    setBackupMessage(null)
    
    try {
      const backup = await createBackup()
      setBackupMessage({ type: 'success', text: `Backup created successfully: ${backup.filename}` })
      loadBackupData() // Refresh backup list
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to create backup' })
    } finally {
      setIsCreatingBackup(false)
      setTimeout(() => setBackupMessage(null), 5000)
    }
  }

  const handleDownloadBackup = (backupId: string) => {
    try {
      downloadBackup(backupId)
      setBackupMessage({ type: 'success', text: 'Backup download started' })
      setTimeout(() => setBackupMessage(null), 3000)
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to download backup' })
      setTimeout(() => setBackupMessage(null), 5000)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
      return
    }

    setIsRestoring(true)
    setBackupMessage(null)
    
    try {
      await restoreBackup(backupId)
      setBackupMessage({ type: 'success', text: 'Database restored successfully' })
      loadBackupData() // Refresh data
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to restore backup' })
    } finally {
      setIsRestoring(false)
      setTimeout(() => setBackupMessage(null), 5000)
    }
  }

  const handleDeleteBackup = (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return
    }

    try {
      deleteBackup(backupId)
      setBackupMessage({ type: 'success', text: 'Backup deleted successfully' })
      loadBackupData() // Refresh backup list
      setTimeout(() => setBackupMessage(null), 3000)
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to delete backup' })
      setTimeout(() => setBackupMessage(null), 5000)
    }
  }

  const handleBackupSettingsChange = (key: keyof BackupSettings, value: any) => {
    const newSettings = { ...backupSettings, [key]: value }
    setBackupSettings(newSettings)
    saveBackupSettings(newSettings)
    
    // Handle auto backup scheduling
    if (key === 'autoBackup') {
      if (value) {
        scheduleBackup(newSettings.frequency)
      } else {
        cancelScheduledBackup()
      }
    } else if (key === 'frequency' && newSettings.autoBackup) {
      scheduleBackup(value)
    }
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
                      <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Kuwait">Kuwait (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Bahrain">Bahrain (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Qatar">Qatar (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Muscat">Muscat (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Tehran">Tehran (GMT+3:30)</SelectItem>
                      <SelectItem value="Asia/Baghdad">Baghdad (GMT+3)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
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
                      <SelectItem value="SAR">Saudi Riyal (SAR) - ريال سعودي</SelectItem>
                      <SelectItem value="AED">UAE Dirham (AED) - درهم إماراتي</SelectItem>
                      <SelectItem value="KWD">Kuwaiti Dinar (KWD) - دينار كويتي</SelectItem>
                      <SelectItem value="BHD">Bahraini Dinar (BHD) - دينار بحريني</SelectItem>
                      <SelectItem value="QAR">Qatari Riyal (QAR) - ريال قطري</SelectItem>
                      <SelectItem value="OMR">Omani Rial (OMR) - ريال عماني</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
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
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
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
          <UsersTab />
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
              {/* Backup Messages */}
              {backupMessage && (
                <Alert className={backupMessage.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className={backupMessage.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                    {backupMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Backup Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dataRetention">
                    {t("dataRetention")} ({t("months")})
                  </Label>
                  <Select
                    value={backupSettings.retention.toString()}
                    onValueChange={(value) => handleBackupSettingsChange("retention", parseInt(value))}
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
                    value={backupSettings.frequency}
                    onValueChange={(value) => handleBackupSettingsChange("frequency", value)}
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

              {/* Auto Backup Toggle */}
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <Label htmlFor="autoBackup">Automatic Backups</Label>
                  <p className="text-sm text-gray-500">Enable automatic backups based on frequency</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => handleBackupSettingsChange("autoBackup", checked)}
                />
              </div>

              {/* Backup Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{t("lastBackup")}</h4>
                    <p className="text-sm text-gray-500">
                      {backups.length > 0 
                        ? new Date(backups[0].createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'No backups created yet'
                      }
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCreateBackup}
                      disabled={isCreatingBackup}
                    >
                      {isCreatingBackup ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4 mr-2" />
                      )}
                      {isCreatingBackup ? 'Creating...' : t("createBackupNow")}
                    </Button>
                  </div>
                </div>

                {/* Backup History */}
                <div className="space-y-2">
                  <h5 className="font-medium">Backup History</h5>
                  {backups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No backups created yet</p>
                      <p className="text-sm">Create your first backup to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {backups.map((backup) => (
                        <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-3">
                            <Database className={`h-4 w-4 ${
                              backup.status === 'completed' ? 'text-green-600' : 
                              backup.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                            <div>
                              <span className="text-sm font-medium">{backup.filename}</span>
                              <p className="text-xs text-gray-500">
                                {new Date(backup.createdAt).toLocaleString()} • {backup.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{formatFileSize(backup.size)}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadBackup(backup.id)}
                            >
                              Download
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRestoreBackup(backup.id)}
                              disabled={isRestoring}
                            >
                              {isRestoring ? 'Restoring...' : 'Restore'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteBackup(backup.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Storage Information */}
              <div className="pt-4 border-t">
                <h5 className="font-medium mb-2">Storage Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">{formatFileSize(storageInfo.totalUsed)}</div>
                    <div className="text-sm text-gray-500">Total Used</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">{formatFileSize(storageInfo.available)}</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">{formatFileSize(storageInfo.totalStorage)}</div>
                    <div className="text-sm text-gray-500">Total Storage</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(storageInfo.totalUsed / storageInfo.totalStorage) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((storageInfo.totalUsed / storageInfo.totalStorage) * 100).toFixed(1)}% used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
