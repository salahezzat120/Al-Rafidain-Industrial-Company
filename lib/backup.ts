// Database backup and restore utilities for Supabase

import { supabase } from './supabase'

export interface BackupInfo {
  id: string
  filename: string
  size: number
  createdAt: string
  type: 'manual' | 'scheduled'
  status: 'completed' | 'failed' | 'in_progress'
}

export interface BackupSettings {
  frequency: 'daily' | 'weekly' | 'monthly'
  retention: number // months
  autoBackup: boolean
  lastBackup?: string
}

export interface StorageInfo {
  totalUsed: number // bytes
  available: number // bytes
  totalStorage: number // bytes
}

/**
 * Create a manual backup of the database
 */
export async function createBackup(): Promise<BackupInfo> {
  try {
    console.log('🔄 Starting database backup...')
    
    // Get all tables and their data
    const tables = await getAllTables()
    const backupData: any = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tables: Object.keys(tables)
      },
      data: tables
    }

    // Create backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')
    const filename = `backup_${timestamp[0]}_${timestamp[1].split('.')[0]}.json`
    
    // Convert to JSON string
    const backupString = JSON.stringify(backupData, null, 2)
    const size = new Blob([backupString]).size

    // Save to localStorage for now (in production, this would go to cloud storage)
    const backupInfo: BackupInfo = {
      id: `backup_${Date.now()}`,
      filename,
      size,
      createdAt: new Date().toISOString(),
      type: 'manual',
      status: 'completed'
    }

    // Store backup in localStorage
    const existingBackups = getBackupHistory()
    existingBackups.unshift(backupInfo)
    
    // Keep only last 10 backups
    const limitedBackups = existingBackups.slice(0, 10)
    localStorage.setItem('database_backups', JSON.stringify(limitedBackups))
    
    // Store the actual backup data
    localStorage.setItem(`backup_${backupInfo.id}`, backupString)
    
    console.log('✅ Backup created successfully:', backupInfo.filename)
    return backupInfo

  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw new Error('Failed to create backup')
  }
}

/**
 * Get all tables and their data from Supabase
 */
async function getAllTables(): Promise<Record<string, any[]>> {
  const tables: Record<string, any[]> = {}
  
  // List of tables to backup
  const tableNames = [
    'users',
    'representatives', 
    'vehicles',
    'drivers',
    'customers',
    'orders',
    'products',
    'warehouses',
    'stock_movements',
    'representative_movements',
    'representative_visits',
    'vehicle_maintenance',
    'fuel_records',
    'vehicle_assignments',
    'vehicle_tracking'
  ]

  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10000) // Limit to prevent memory issues

      if (error) {
        console.warn(`⚠️ Could not backup table ${tableName}:`, error.message)
        tables[tableName] = []
      } else {
        tables[tableName] = data || []
        console.log(`✅ Backed up table ${tableName}: ${data?.length || 0} records`)
      }
    } catch (error) {
      console.warn(`⚠️ Error backing up table ${tableName}:`, error)
      tables[tableName] = []
    }
  }

  return tables
}

/**
 * Get backup history from localStorage
 */
export function getBackupHistory(): BackupInfo[] {
  try {
    const backups = localStorage.getItem('database_backups')
    return backups ? JSON.parse(backups) : []
  } catch (error) {
    console.error('Error loading backup history:', error)
    return []
  }
}

/**
 * Download a backup file
 */
export function downloadBackup(backupId: string): void {
  try {
    const backupData = localStorage.getItem(`backup_${backupId}`)
    if (!backupData) {
      throw new Error('Backup not found')
    }

    const backupInfo = getBackupHistory().find(b => b.id === backupId)
    if (!backupInfo) {
      throw new Error('Backup info not found')
    }

    // Create and download file
    const blob = new Blob([backupData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backupInfo.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('✅ Backup downloaded:', backupInfo.filename)
  } catch (error) {
    console.error('❌ Download failed:', error)
    throw new Error('Failed to download backup')
  }
}

/**
 * Restore database from backup
 */
export async function restoreBackup(backupId: string): Promise<void> {
  try {
    console.log('🔄 Starting database restore...')
    
    const backupData = localStorage.getItem(`backup_${backupId}`)
    if (!backupData) {
      throw new Error('Backup not found')
    }

    const backup = JSON.parse(backupData)
    if (!backup.data) {
      throw new Error('Invalid backup format')
    }

    // Restore each table
    for (const [tableName, records] of Object.entries(backup.data)) {
      if (Array.isArray(records) && records.length > 0) {
        try {
          // Clear existing data (be careful in production!)
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

          if (deleteError) {
            console.warn(`⚠️ Could not clear table ${tableName}:`, deleteError.message)
          }

          // Insert backup data
          const { error: insertError } = await supabase
            .from(tableName)
            .insert(records)

          if (insertError) {
            console.warn(`⚠️ Could not restore table ${tableName}:`, insertError.message)
          } else {
            console.log(`✅ Restored table ${tableName}: ${records.length} records`)
          }
        } catch (error) {
          console.warn(`⚠️ Error restoring table ${tableName}:`, error)
        }
      }
    }

    console.log('✅ Database restore completed')
  } catch (error) {
    console.error('❌ Restore failed:', error)
    throw new Error('Failed to restore backup')
  }
}

/**
 * Delete a backup
 */
export function deleteBackup(backupId: string): void {
  try {
    // Remove from history
    const backups = getBackupHistory()
    const filteredBackups = backups.filter(b => b.id !== backupId)
    localStorage.setItem('database_backups', JSON.stringify(filteredBackups))
    
    // Remove backup data
    localStorage.removeItem(`backup_${backupId}`)
    
    console.log('✅ Backup deleted:', backupId)
  } catch (error) {
    console.error('❌ Delete failed:', error)
    throw new Error('Failed to delete backup')
  }
}

/**
 * Get storage information (mock for now)
 */
export function getStorageInfo(): StorageInfo {
  // Calculate actual storage usage from localStorage
  let totalUsed = 0
  for (let key in localStorage) {
    if (key.startsWith('backup_') || key === 'database_backups') {
      totalUsed += localStorage[key].length
    }
  }

  // Mock total storage (100 GB)
  const totalStorage = 100 * 1024 * 1024 * 1024 // 100 GB in bytes
  const available = totalStorage - totalUsed

  return {
    totalUsed,
    available,
    totalStorage
  }
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get backup settings
 */
export function getBackupSettings(): BackupSettings {
  try {
    const settings = localStorage.getItem('backup_settings')
    return settings ? JSON.parse(settings) : {
      frequency: 'daily',
      retention: 12,
      autoBackup: false
    }
  } catch (error) {
    console.error('Error loading backup settings:', error)
    return {
      frequency: 'daily',
      retention: 12,
      autoBackup: false
    }
  }
}

/**
 * Save backup settings
 */
export function saveBackupSettings(settings: BackupSettings): void {
  try {
    localStorage.setItem('backup_settings', JSON.stringify(settings))
    console.log('✅ Backup settings saved')
  } catch (error) {
    console.error('❌ Failed to save backup settings:', error)
    throw new Error('Failed to save backup settings')
  }
}

/**
 * Schedule automatic backups
 */
export function scheduleBackup(frequency: 'daily' | 'weekly' | 'monthly'): void {
  // Clear existing schedule
  const existingSchedule = localStorage.getItem('backup_schedule')
  if (existingSchedule) {
    clearInterval(parseInt(existingSchedule))
  }

  // Calculate interval in milliseconds
  const intervals = {
    daily: 24 * 60 * 60 * 1000, // 24 hours
    weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
    monthly: 30 * 24 * 60 * 60 * 1000 // 30 days
  }

  const interval = intervals[frequency]
  
  // Schedule backup
  const scheduleId = setInterval(async () => {
    try {
      console.log(`🔄 Running scheduled ${frequency} backup...`)
      await createBackup()
      console.log(`✅ Scheduled ${frequency} backup completed`)
    } catch (error) {
      console.error(`❌ Scheduled ${frequency} backup failed:`, error)
    }
  }, interval)

  // Save schedule ID
  localStorage.setItem('backup_schedule', scheduleId.toString())
  
  console.log(`✅ ${frequency} backup scheduled`)
}

/**
 * Cancel scheduled backups
 */
export function cancelScheduledBackup(): void {
  const existingSchedule = localStorage.getItem('backup_schedule')
  if (existingSchedule) {
    clearInterval(parseInt(existingSchedule))
    localStorage.removeItem('backup_schedule')
    console.log('✅ Scheduled backup cancelled')
  }
}
