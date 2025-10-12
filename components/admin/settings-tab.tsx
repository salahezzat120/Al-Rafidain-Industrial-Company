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
import { useCurrency } from "@/contexts/currency-context"
import { useSettings } from "@/contexts/settings-context"
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
  const { t, setLanguage } = useLanguage()
  const { setCurrency } = useCurrency()
  const { 
    systemSettings, 
    updateSystemSettings, 
    resetSystemSettings,
    isLoading, 
    isSaving, 
    lastSaved, 
    error, 
    clearError 
  } = useSettings()

  // Local state for form management
  const [localSettings, setLocalSettings] = useState(systemSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Backup-related state
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ totalUsed: 0, available: 0, totalStorage: 0 })
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({ frequency: 'daily', retention: 12, autoBackup: false })
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load backup data on component mount
  useEffect(() => {
    loadBackupData()
  }, [])

  // Update local settings when system settings change
  useEffect(() => {
    setLocalSettings(systemSettings)
    setHasChanges(false)
  }, [systemSettings])

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(systemSettings))
  }, [localSettings, systemSettings])

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

  const saveSettings = async () => {
    setSaveStatus('idle')
    clearError()
    
    try {
      // Calculate changes
      const changes = Object.keys(localSettings).reduce((acc, key) => {
        if (localSettings[key as keyof typeof localSettings] !== systemSettings[key as keyof typeof systemSettings]) {
          acc[key] = localSettings[key as keyof typeof localSettings]
        }
        return acc
      }, {} as Partial<typeof systemSettings>)

      if (Object.keys(changes).length === 0) {
        setSaveStatus('idle')
        return
      }

      // Save to database and localStorage via context
      await updateSystemSettings(changes)
      
      setHasChanges(false)
      setSaveStatus('success')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    }
  }

  const resetToDefaults = async () => {
    setSaveStatus('idle')
    clearError()
    
    try {
      await resetSystemSettings()
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error resetting settings:', error)
      setSaveStatus('error')
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
    
    // Automatically apply currency and language changes system-wide
    if (key === 'currency') {
      setCurrency(value)
    } else if (key === 'language') {
      setLanguage(value)
    }
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
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    setIsRestoring(true)
    setBackupMessage(null)
    
    try {
      await restoreBackup(backupId)
      setBackupMessage({ type: 'success', text: 'Backup restored successfully' })
      // Reload settings after restore
      window.location.reload()
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to restore backup' })
    } finally {
      setIsRestoring(false)
      setTimeout(() => setBackupMessage(null), 5000)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await deleteBackup(backupId)
      setBackupMessage({ type: 'success', text: 'Backup deleted successfully' })
      loadBackupData() // Refresh backup list
      setTimeout(() => setBackupMessage(null), 3000)
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to delete backup' })
    }
  }

  const handleBackupSettingsChange = (key: string, value: any) => {
    const newSettings = { ...backupSettings, [key]: value }
    setBackupSettings(newSettings)
    saveBackupSettings(newSettings)
    
    // Handle scheduling
    if (key === 'autoBackup' && value) {
      scheduleBackup(backupSettings.frequency)
    } else if (key === 'autoBackup' && !value) {
      cancelScheduledBackup()
    } else if (key === 'frequency' && backupSettings.autoBackup) {
      scheduleBackup(value)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("systemSettings")}</h2>
        <p className="text-gray-600">{t("configureSystemPreferences")}</p>
        {lastSaved && (
          <p className="text-sm text-gray-500 mt-1">
            Last saved: {lastSaved.toLocaleString()}
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {saveStatus === 'success' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Settings saved successfully and applied system-wide!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

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
                    value={localSettings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">{t("companyEmail")}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={localSettings.companyEmail}
                    onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">{t("companyPhone")}</Label>
                  <Input
                    id="companyPhone"
                    value={localSettings.companyPhone}
                    onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">{t("companyAddress")}</Label>
                  <Textarea
                    id="companyAddress"
                    value={localSettings.companyAddress}
                    onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
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
                  <Select
                    value={localSettings.timezone}
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">{t("currency")}</Label>
                  <Select
                    value={localSettings.currency}
                    onValueChange={(value) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">{t("language")}</Label>
                  <Select
                    value={localSettings.language}
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Operational Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  {t("operationalSettings")}
                </CardTitle>
                <CardDescription>{t("operationalSettingsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoAssignTasks">{t("autoAssignTasks")}</Label>
                    <p className="text-sm text-gray-500">{t("autoAssignTasksDescription")}</p>
                  </div>
                  <Switch
                    id="autoAssignTasks"
                    checked={localSettings.autoAssignTasks}
                    onCheckedChange={(checked) => handleSettingChange('autoAssignTasks', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="realTimeTracking">{t("realTimeTracking")}</Label>
                    <p className="text-sm text-gray-500">{t("realTimeTrackingDescription")}</p>
                  </div>
                  <Switch
                    id="realTimeTracking"
                    checked={localSettings.realTimeTracking}
                    onCheckedChange={(checked) => handleSettingChange('realTimeTracking', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  {t("notificationSettings")}
                </CardTitle>
                <CardDescription>{t("notificationSettingsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">{t("emailNotifications")}</Label>
                    <p className="text-sm text-gray-500">{t("emailNotificationsDescription")}</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={localSettings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">{t("smsNotifications")}</Label>
                    <p className="text-sm text-gray-500">{t("smsNotificationsDescription")}</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={localSettings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">{t("pushNotifications")}</Label>
                    <p className="text-sm text-gray-500">{t("pushNotificationsDescription")}</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={localSettings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">You have unsaved changes</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                disabled={isSaving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={saveSettings}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          {/* Backup Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Backup Actions
                </CardTitle>
                <CardDescription>Create and manage system backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="w-full"
                >
                  {isCreatingBackup ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup
                    </>
                  )}
                </Button>
                
                {backupMessage && (
                  <Alert variant={backupMessage.type === 'error' ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{backupMessage.text}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
                <CardDescription>Current storage usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span>{formatFileSize(storageInfo.totalUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span>{formatFileSize(storageInfo.available)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatFileSize(storageInfo.totalStorage)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>Previous system backups</CardDescription>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No backups found</p>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{backup.filename}</p>
                        <p className="text-sm text-gray-500">
                          {backup.date} • {backup.size}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadBackup(backup.id)}
                        >
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={isRestoring}
                        >
                          {isRestoring ? 'Restoring...' : 'Restore'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBackup(backup.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
