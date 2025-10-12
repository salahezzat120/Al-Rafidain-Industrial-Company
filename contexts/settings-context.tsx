'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { SystemSettings, SecuritySettings, IntegrationSettings } from '@/lib/settings';

interface SettingsContextType {
  // System Settings
  systemSettings: SystemSettings;
  updateSystemSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  resetSystemSettings: () => Promise<void>;
  
  // Security Settings
  securitySettings: SecuritySettings;
  updateSecuritySettings: (updates: Partial<SecuritySettings>) => Promise<void>;
  
  // Integration Settings
  integrationSettings: IntegrationSettings;
  updateIntegrationSettings: (updates: Partial<IntegrationSettings>) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings
const defaultSystemSettings: SystemSettings = {
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
};

const defaultSecuritySettings: SecuritySettings = {
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
  email2FA: false,
};

const defaultIntegrationSettings: IntegrationSettings = {
  smtpHost: "smtp.gmail.com",
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
};

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(defaultIntegrationSettings);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load settings from database and localStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to load from database first
      if (supabase) {
        const { data: dbSettings, error: dbError } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (!dbError && dbSettings) {
          // Load from database
          setSystemSettings({ ...defaultSystemSettings, ...dbSettings.system_settings });
          setSecuritySettings({ ...defaultSecuritySettings, ...dbSettings.security_settings });
          setIntegrationSettings({ ...defaultIntegrationSettings, ...dbSettings.integration_settings });
          setLastSaved(new Date(dbSettings.updated_at));
          console.log('Settings loaded from database');
        } else {
          // Fallback to localStorage
          console.log('Database load failed, using localStorage:', dbError?.message);
          loadFromLocalStorage();
        }
      } else {
        // Fallback to localStorage
        console.log('Supabase not available, using localStorage');
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      // Load system settings
      const savedSystemSettings = localStorage.getItem('system-settings');
      if (savedSystemSettings) {
        setSystemSettings({ ...defaultSystemSettings, ...JSON.parse(savedSystemSettings) });
      }

      // Load security settings
      const savedSecuritySettings = localStorage.getItem('security-settings');
      if (savedSecuritySettings) {
        setSecuritySettings({ ...defaultSecuritySettings, ...JSON.parse(savedSecuritySettings) });
      }

      // Load integration settings
      const savedIntegrationSettings = localStorage.getItem('integration-settings');
      if (savedIntegrationSettings) {
        setIntegrationSettings({ ...defaultIntegrationSettings, ...JSON.parse(savedIntegrationSettings) });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const saveToDatabase = async (settings: any, type: 'system' | 'security' | 'integration') => {
    if (!supabase) {
      console.log('Supabase not available, skipping database save');
      return;
    }

    try {
      const settingsData = {
        [`${type}_settings`]: settings,
        updated_at: new Date().toISOString(),
      };

      // First, check if the table exists by trying to select from it
      const { error: tableCheckError } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.log('System settings table does not exist, using localStorage only');
        return; // Table doesn't exist, skip database save
      }

      // Try to update existing record
      const { error: updateError } = await supabase
        .from('system_settings')
        .update(settingsData)
        .eq('id', 1);

      if (updateError) {
        // If update fails, try to insert new record
        const { error: insertError } = await supabase
          .from('system_settings')
          .insert({ id: 1, ...settingsData });

        if (insertError) {
          console.log('Failed to insert settings, using localStorage only:', insertError.message);
          return; // Don't throw error, just use localStorage
        }
      }
    } catch (error) {
      console.log('Database save failed, using localStorage only:', error);
      // Don't throw error, just use localStorage as fallback
    }
  };

  const saveToLocalStorage = (settings: any, key: string) => {
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  };

  const updateSystemSettings = async (updates: Partial<SystemSettings>) => {
    setIsSaving(true);
    setError(null);

    try {
      const newSettings = { ...systemSettings, ...updates };
      setSystemSettings(newSettings);

      // Save to database (will gracefully fallback to localStorage if database fails)
      await saveToDatabase(newSettings, 'system');
      
      // Always save to localStorage as backup
      saveToLocalStorage(newSettings, 'system-settings');
      
      setLastSaved(new Date());
      
      // Broadcast settings change to other components
      window.dispatchEvent(new CustomEvent('settingsChanged', { 
        detail: { type: 'system', settings: newSettings } 
      }));
      
      console.log('System settings updated successfully');
      
    } catch (error) {
      console.error('Error updating system settings:', error);
      setError('Failed to save system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    setIsSaving(true);
    setError(null);

    try {
      const newSettings = { ...securitySettings, ...updates };
      setSecuritySettings(newSettings);

      // Save to database
      await saveToDatabase(newSettings, 'security');
      
      // Save to localStorage as backup
      saveToLocalStorage(newSettings, 'security-settings');
      
      setLastSaved(new Date());
      
      // Broadcast settings change to other components
      window.dispatchEvent(new CustomEvent('settingsChanged', { 
        detail: { type: 'security', settings: newSettings } 
      }));
      
    } catch (error) {
      console.error('Error updating security settings:', error);
      setError('Failed to save security settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateIntegrationSettings = async (updates: Partial<IntegrationSettings>) => {
    setIsSaving(true);
    setError(null);

    try {
      const newSettings = { ...integrationSettings, ...updates };
      setIntegrationSettings(newSettings);

      // Save to database
      await saveToDatabase(newSettings, 'integration');
      
      // Save to localStorage as backup
      saveToLocalStorage(newSettings, 'integration-settings');
      
      setLastSaved(new Date());
      
      // Broadcast settings change to other components
      window.dispatchEvent(new CustomEvent('settingsChanged', { 
        detail: { type: 'integration', settings: newSettings } 
      }));
      
    } catch (error) {
      console.error('Error updating integration settings:', error);
      setError('Failed to save integration settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSystemSettings = async () => {
    setIsSaving(true);
    setError(null);

    try {
      setSystemSettings(defaultSystemSettings);

      // Save to database
      await saveToDatabase(defaultSystemSettings, 'system');
      
      // Save to localStorage as backup
      saveToLocalStorage(defaultSystemSettings, 'system-settings');
      
      setLastSaved(new Date());
      
      // Broadcast settings change to other components
      window.dispatchEvent(new CustomEvent('settingsChanged', { 
        detail: { type: 'system', settings: defaultSystemSettings } 
      }));
      
    } catch (error) {
      console.error('Error resetting system settings:', error);
      setError('Failed to reset system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: SettingsContextType = {
    systemSettings,
    updateSystemSettings,
    resetSystemSettings,
    securitySettings,
    updateSecuritySettings,
    integrationSettings,
    updateIntegrationSettings,
    isLoading,
    isSaving,
    lastSaved,
    error,
    clearError,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Hook for listening to settings changes
export function useSettingsListener(callback: (settings: any, type: string) => void) {
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      callback(event.detail.settings, event.detail.type);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, [callback]);
}
