export interface LoyaltyEvaluation {
  id: string
  employee_id: string
  period_month: string // YYYY-MM-01
  visits_count: number
  deal_closing_rate: number
  punctuality_score: number
  customer_satisfaction: number
  comments?: string | null
  total_points: number
  created_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateLoyaltyEvaluation {
  employee_id: string
  period_month: string
  visits_count: number
  deal_closing_rate: number
  punctuality_score: number
  customer_satisfaction: number
  comments?: string | null
  total_points?: number
}

export interface LoyaltyLeaderboardRow {
  period_month: string
  employee_id: string
  points: number
  avg_closing_rate: number
  avg_punctuality: number
  avg_csat: number
  total_visits: number
}


