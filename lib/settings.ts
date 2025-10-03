// System Settings Management Library
// Handles settings persistence, validation, and API interactions

export interface SystemSettings {
  // Company Information
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  
  // System Preferences
  timezone: string
  currency: string
  language: string
  autoAssignTasks: boolean
  realTimeTracking: boolean
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  
  // Data Management
  dataRetention: string
  backupFrequency: string
  workingHours: {
    start: string
    end: string
  }
  
  // Business Settings
  customerTypes: string[]
  coverageZones: string[]
  selectedCustomerType: string
  selectedCoverageZone: string
}

export interface SecuritySettings {
  // Password Policy
  minPasswordLength: number
  passwordExpiry: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  
  // Session Management
  sessionTimeout: number
  maxLoginAttempts: number
  lockoutEnabled: boolean
  
  // Two-Factor Authentication
  twoFactorEnabled: boolean
  sms2FA: boolean
  email2FA: boolean
}

export interface IntegrationSettings {
  // Email Integration
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  emailEnabled: boolean
  
  // SMS Integration
  smsProvider: string
  smsApiKey: string
  smsEnabled: boolean
  
  // Database Integration
  supabaseEnabled: boolean
  backupEnabled: boolean
  
  // API Settings
  apiRateLimit: number
  apiTimeout: number
  apiEnabled: boolean
}

export interface BackupInfo {
  lastBackup: string
  backupHistory: Array<{
    filename: string
    size: string
    date: string
  }>
  storageInfo: {
    totalUsed: string
    available: string
    totalStorage: string
  }
}

// Default settings
export const defaultSystemSettings: SystemSettings = {
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

export const defaultSecuritySettings: SecuritySettings = {
  minPasswordLength: 8,
  passwordExpiry: 90,
  requireUppercase: true,
  requireNumbers: true,
  requireSymbols: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  lockoutEnabled: true,
  twoFactorEnabled: false,
  sms2FA: false,
  email2FA: true,
}

export const defaultIntegrationSettings: IntegrationSettings = {
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  emailEnabled: false,
  smsProvider: "twilio",
  smsApiKey: "",
  smsEnabled: false,
  supabaseEnabled: true,
  backupEnabled: true,
  apiRateLimit: 1000,
  apiTimeout: 30,
  apiEnabled: true,
}

// Settings management functions
export class SettingsManager {
  private static instance: SettingsManager
  private settings: SystemSettings
  private securitySettings: SecuritySettings
  private integrationSettings: IntegrationSettings

  constructor() {
    this.settings = this.loadSystemSettings()
    this.securitySettings = this.loadSecuritySettings()
    this.integrationSettings = this.loadIntegrationSettings()
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager()
    }
    return SettingsManager.instance
  }

  // System Settings
  public getSystemSettings(): SystemSettings {
    return this.settings
  }

  public updateSystemSettings(updates: Partial<SystemSettings>): void {
    this.settings = { ...this.settings, ...updates }
    this.saveSystemSettings()
  }

  public resetSystemSettings(): void {
    this.settings = { ...defaultSystemSettings }
    this.saveSystemSettings()
  }

  private loadSystemSettings(): SystemSettings {
    try {
      const saved = localStorage.getItem('system-settings')
      if (saved) {
        return { ...defaultSystemSettings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Error loading system settings:', error)
    }
    return defaultSystemSettings
  }

  private saveSystemSettings(): void {
    try {
      localStorage.setItem('system-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Error saving system settings:', error)
    }
  }

  // Security Settings
  public getSecuritySettings(): SecuritySettings {
    return this.securitySettings
  }

  public updateSecuritySettings(updates: Partial<SecuritySettings>): void {
    this.securitySettings = { ...this.securitySettings, ...updates }
    this.saveSecuritySettings()
  }

  private loadSecuritySettings(): SecuritySettings {
    try {
      const saved = localStorage.getItem('security-settings')
      if (saved) {
        return { ...defaultSecuritySettings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Error loading security settings:', error)
    }
    return defaultSecuritySettings
  }

  private saveSecuritySettings(): void {
    try {
      localStorage.setItem('security-settings', JSON.stringify(this.securitySettings))
    } catch (error) {
      console.error('Error saving security settings:', error)
    }
  }

  // Integration Settings
  public getIntegrationSettings(): IntegrationSettings {
    return this.integrationSettings
  }

  public updateIntegrationSettings(updates: Partial<IntegrationSettings>): void {
    this.integrationSettings = { ...this.integrationSettings, ...updates }
    this.saveIntegrationSettings()
  }

  private loadIntegrationSettings(): IntegrationSettings {
    try {
      const saved = localStorage.getItem('integration-settings')
      if (saved) {
        return { ...defaultIntegrationSettings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Error loading integration settings:', error)
    }
    return defaultIntegrationSettings
  }

  private saveIntegrationSettings(): void {
    try {
      localStorage.setItem('integration-settings', JSON.stringify(this.integrationSettings))
    } catch (error) {
      console.error('Error saving integration settings:', error)
    }
  }

  // Validation
  public validateSystemSettings(settings: SystemSettings): string[] {
    const errors: string[] = []

    if (!settings.companyName.trim()) {
      errors.push('Company name is required')
    }

    if (!settings.companyEmail.trim()) {
      errors.push('Company email is required')
    } else if (!this.isValidEmail(settings.companyEmail)) {
      errors.push('Invalid email format')
    }

    if (!settings.companyPhone.trim()) {
      errors.push('Company phone is required')
    }

    if (!settings.companyAddress.trim()) {
      errors.push('Company address is required')
    }

    return errors
  }

  public validateSecuritySettings(settings: SecuritySettings): string[] {
    const errors: string[] = []

    if (settings.minPasswordLength < 6 || settings.minPasswordLength > 32) {
      errors.push('Password length must be between 6 and 32 characters')
    }

    if (settings.passwordExpiry < 30 || settings.passwordExpiry > 365) {
      errors.push('Password expiry must be between 30 and 365 days')
    }

    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
      errors.push('Session timeout must be between 5 and 480 minutes')
    }

    if (settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 10) {
      errors.push('Max login attempts must be between 3 and 10')
    }

    return errors
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Export/Import
  public exportSettings(): string {
    return JSON.stringify({
      system: this.settings,
      security: this.securitySettings,
      integration: this.integrationSettings,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  public importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson)
      
      if (imported.system) {
        this.settings = { ...defaultSystemSettings, ...imported.system }
        this.saveSystemSettings()
      }
      
      if (imported.security) {
        this.securitySettings = { ...defaultSecuritySettings, ...imported.security }
        this.saveSecuritySettings()
      }
      
      if (imported.integration) {
        this.integrationSettings = { ...defaultIntegrationSettings, ...imported.integration }
        this.saveIntegrationSettings()
      }
      
      return true
    } catch (error) {
      console.error('Error importing settings:', error)
      return false
    }
  }

  // Backup Management
  public async createBackup(): Promise<boolean> {
    try {
      const backupData = {
        settings: this.exportSettings(),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
      
      // In a real implementation, this would save to a database or file system
      localStorage.setItem('backup-' + Date.now(), JSON.stringify(backupData))
      return true
    } catch (error) {
      console.error('Error creating backup:', error)
      return false
    }
  }

  public getBackupInfo(): BackupInfo {
    const backups = this.getBackupHistory()
    const lastBackup = backups.length > 0 ? backups[0].date : 'No backups available'
    
    return {
      lastBackup,
      backupHistory: backups,
      storageInfo: {
        totalUsed: '15.2 GB',
        available: '84.8 GB',
        totalStorage: '100 GB'
      }
    }
  }

  private getBackupHistory(): Array<{ filename: string; size: string; date: string }> {
    const backups: Array<{ filename: string; size: string; date: string }> = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('backup-')) {
        const timestamp = key.replace('backup-', '')
        const date = new Date(parseInt(timestamp))
        backups.push({
          filename: `backup_${date.toISOString().split('T')[0]}_${date.toTimeString().split(' ')[0].replace(/:/g, '')}.json`,
          size: '2.3 MB',
          date: date.toLocaleString()
        })
      }
    }
    
    return backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

// Export singleton instance
export const settingsManager = SettingsManager.getInstance()
