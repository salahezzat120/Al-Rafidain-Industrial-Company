import { supabase } from '@/lib/supabase'
import type {
  CustomerLoyaltyPoints,
  CustomerLoyaltyTransaction,
  RepresentativeLoyaltyPoints,
  RepresentativeLoyaltyTransaction,
  LoyaltySettings,
  CustomerLoyaltySummary,
  RepresentativeLoyaltySummary,
  LoyaltyLeaderboardEntry,
  CreateLoyaltyTransaction,
  UpdateLoyaltySettings
} from '@/types/simple-loyalty'

// Customer Loyalty Functions
export async function getCustomerLoyaltyPoints(customerId: string): Promise<CustomerLoyaltyPoints | null> {
  const { data, error } = await supabase
    .from('customer_loyalty_points')
    .select('*')
    .eq('customer_id', customerId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer loyalty points:', error)
    throw error
  }

  return data
}

export async function getCustomerLoyaltyTransactions(customerId: string, limit: number = 50): Promise<CustomerLoyaltyTransaction[]> {
  const { data, error } = await supabase
    .from('customer_loyalty_transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching customer loyalty transactions:', error)
    throw error
  }

  return data || []
}

export async function getCustomerLoyaltySummary(customerId: string): Promise<CustomerLoyaltySummary | null> {
  const { data, error } = await supabase
    .from('customer_loyalty_summary')
    .select('*')
    .eq('customer_id', customerId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer loyalty summary:', error)
    throw error
  }

  return data
}

// Representative Loyalty Functions
export async function getRepresentativeLoyaltyPoints(representativeId: string): Promise<RepresentativeLoyaltyPoints | null> {
  const { data, error } = await supabase
    .from('representative_loyalty_points')
    .select('*')
    .eq('representative_id', representativeId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching representative loyalty points:', error)
    throw error
  }

  return data
}

export async function getRepresentativeLoyaltyTransactions(representativeId: string, limit: number = 50): Promise<RepresentativeLoyaltyTransaction[]> {
  const { data, error } = await supabase
    .from('representative_loyalty_transactions')
    .select('*')
    .eq('representative_id', representativeId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching representative loyalty transactions:', error)
    throw error
  }

  return data || []
}

export async function getRepresentativeLoyaltySummary(representativeId: string): Promise<RepresentativeLoyaltySummary | null> {
  const { data, error } = await supabase
    .from('representative_loyalty_summary')
    .select('*')
    .eq('representative_id', representativeId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching representative loyalty summary:', error)
    throw error
  }

  return data
}

// Leaderboard Functions
export async function getCustomerLoyaltyLeaderboard(limit: number = 10): Promise<LoyaltyLeaderboardEntry[]> {
  const { data, error } = await supabase
    .rpc('get_customer_loyalty_leaderboard', { limit_count: limit })

  if (error) {
    console.error('Error fetching customer loyalty leaderboard:', error)
    throw error
  }

  return data || []
}

export async function getRepresentativeLoyaltyLeaderboard(limit: number = 10): Promise<LoyaltyLeaderboardEntry[]> {
  const { data, error } = await supabase
    .rpc('get_representative_loyalty_leaderboard', { limit_count: limit })

  if (error) {
    console.error('Error fetching representative loyalty leaderboard:', error)
    throw error
  }

  return data || []
}

// Admin Functions
export async function getAllCustomerLoyaltySummaries(): Promise<CustomerLoyaltySummary[]> {
  const { data, error } = await supabase
    .from('customer_loyalty_summary')
    .select('*')
    .order('current_points', { ascending: false })

  if (error) {
    console.error('Error fetching all customer loyalty summaries:', error)
    throw error
  }

  return data || []
}

export async function getAllRepresentativeLoyaltySummaries(): Promise<RepresentativeLoyaltySummary[]> {
  const { data, error } = await supabase
    .from('representative_loyalty_summary')
    .select('*')
    .order('current_points', { ascending: false })

  if (error) {
    console.error('Error fetching all representative loyalty summaries:', error)
    throw error
  }

  return data || []
}

// Loyalty Settings
export async function getLoyaltySettings(): Promise<LoyaltySettings[]> {
  const { data, error } = await supabase
    .from('loyalty_settings')
    .select('*')
    .order('setting_key')

  if (error) {
    console.error('Error fetching loyalty settings:', error)
    throw error
  }

  return data || []
}

export async function updateLoyaltySetting(settingKey: string, settingValue: string, description?: string): Promise<LoyaltySettings> {
  const { data, error } = await supabase
    .from('loyalty_settings')
    .upsert({
      setting_key: settingKey,
      setting_value: settingValue,
      description: description
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error updating loyalty setting:', error)
    throw error
  }

  return data
}

// Manual Point Management
export async function addLoyaltyPoints(transaction: CreateLoyaltyTransaction): Promise<void> {
  if (transaction.customer_id) {
    // Add points to customer
    const { error: pointsError } = await supabase
      .from('customer_loyalty_points')
      .upsert({
        customer_id: transaction.customer_id,
        points: transaction.points,
        total_earned: transaction.points,
        last_activity_date: new Date().toISOString()
      }, {
        onConflict: 'customer_id'
      })

    if (pointsError) {
      console.error('Error adding customer loyalty points:', pointsError)
      throw pointsError
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('customer_loyalty_transactions')
      .insert({
        customer_id: transaction.customer_id,
        order_id: transaction.order_id,
        transaction_type: transaction.transaction_type,
        points: transaction.points,
        description: transaction.description
      })

    if (transactionError) {
      console.error('Error recording customer loyalty transaction:', transactionError)
      throw transactionError
    }
  }

  if (transaction.representative_id) {
    // Add points to representative
    const { error: pointsError } = await supabase
      .from('representative_loyalty_points')
      .upsert({
        representative_id: transaction.representative_id,
        points: transaction.points,
        total_earned: transaction.points,
        last_activity_date: new Date().toISOString()
      }, {
        onConflict: 'representative_id'
      })

    if (pointsError) {
      console.error('Error adding representative loyalty points:', pointsError)
      throw pointsError
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('representative_loyalty_transactions')
      .insert({
        representative_id: transaction.representative_id,
        order_id: transaction.order_id,
        transaction_type: transaction.transaction_type,
        points: transaction.points,
        description: transaction.description
      })

    if (transactionError) {
      console.error('Error recording representative loyalty transaction:', transactionError)
      throw transactionError
    }
  }
}

export async function redeemLoyaltyPoints(customerId: string, pointsToRedeem: number, description?: string): Promise<void> {
  // Get current points
  const currentPoints = await getCustomerLoyaltyPoints(customerId)
  
  if (!currentPoints || currentPoints.points < pointsToRedeem) {
    throw new Error('Insufficient loyalty points')
  }

  // Update points
  const { error: pointsError } = await supabase
    .from('customer_loyalty_points')
    .update({
      points: currentPoints.points - pointsToRedeem,
      total_redeemed: currentPoints.total_redeemed + pointsToRedeem,
      last_activity_date: new Date().toISOString()
    })
    .eq('customer_id', customerId)

  if (pointsError) {
    console.error('Error redeeming customer loyalty points:', pointsError)
    throw pointsError
  }

  // Record transaction
  const { error: transactionError } = await supabase
    .from('customer_loyalty_transactions')
    .insert({
      customer_id: customerId,
      transaction_type: 'redeemed',
      points: -pointsToRedeem,
      description: description || `Redeemed ${pointsToRedeem} points`
    })

  if (transactionError) {
    console.error('Error recording redemption transaction:', transactionError)
    throw transactionError
  }
}

// Utility Functions
export function getLoyaltyTier(points: number, type: 'customer' | 'representative'): string {
  if (type === 'customer') {
    if (points >= 100) return 'Gold'
    if (points >= 50) return 'Silver'
    if (points >= 10) return 'Bronze'
    return 'New'
  } else {
    if (points >= 200) return 'Platinum'
    if (points >= 100) return 'Gold'
    if (points >= 50) return 'Silver'
    if (points >= 10) return 'Bronze'
    return 'New'
  }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'Platinum': return 'text-purple-600 bg-purple-100'
    case 'Gold': return 'text-yellow-600 bg-yellow-100'
    case 'Silver': return 'text-gray-600 bg-gray-100'
    case 'Bronze': return 'text-orange-600 bg-orange-100'
    default: return 'text-gray-500 bg-gray-50'
  }
}

