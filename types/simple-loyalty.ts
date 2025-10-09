// Simple Loyalty System Types

export interface CustomerLoyaltyPoints {
  id: string
  customer_id: string
  points: number
  total_earned: number
  total_redeemed: number
  last_activity_date: string
  created_at: string
  updated_at: string
}

export interface CustomerLoyaltyTransaction {
  id: string
  customer_id: string
  order_id?: string
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'admin_adjustment'
  points: number
  description?: string
  created_at: string
}

export interface RepresentativeLoyaltyPoints {
  id: string
  representative_id: string
  points: number
  total_earned: number
  total_redeemed: number
  last_activity_date: string
  created_at: string
  updated_at: string
}

export interface RepresentativeLoyaltyTransaction {
  id: string
  representative_id: string
  order_id?: string
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'admin_adjustment'
  points: number
  description?: string
  created_at: string
}

export interface LoyaltySettings {
  id: string
  setting_key: string
  setting_value: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CustomerLoyaltySummary {
  customer_id: string
  customer_code: string
  customer_name: string
  email: string
  phone: string
  current_points: number
  total_earned: number
  total_redeemed: number
  last_activity_date: string
  loyalty_tier: 'New' | 'Bronze' | 'Silver' | 'Gold'
}

export interface RepresentativeLoyaltySummary {
  representative_id: string
  representative_name: string
  email: string
  phone: string
  current_points: number
  total_earned: number
  total_redeemed: number
  last_activity_date: string
  loyalty_tier: 'New' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
}

export interface LoyaltyLeaderboardEntry {
  customer_id?: string
  representative_id?: string
  customer_name?: string
  representative_name?: string
  current_points: number
  total_earned: number
  loyalty_tier: string
  rank_position: number
}

export interface CreateLoyaltyTransaction {
  customer_id?: string
  representative_id?: string
  order_id?: string
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'admin_adjustment'
  points: number
  description?: string
}

export interface UpdateLoyaltySettings {
  setting_key: string
  setting_value: string
  description?: string
}





