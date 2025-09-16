import { supabase } from '@/lib/supabase'
import type { CreateLoyaltyEvaluation, LoyaltyEvaluation, LoyaltyLeaderboardRow } from '@/types/loyalty'

export function calculateLoyaltyPoints(input: Pick<CreateLoyaltyEvaluation, 'visits_count'|'deal_closing_rate'|'punctuality_score'|'customer_satisfaction'>): number {
  // Simple weighted formula (adjustable):
  // visits (30%), closing rate (30%), punctuality (20%), CSAT (20%)
  const visitsScore = Math.min(input.visits_count, 100) / 100 * 30
  const closingScore = (input.deal_closing_rate / 100) * 30
  const punctualityScore = (input.punctuality_score / 5) * 20
  const csatScore = (input.customer_satisfaction / 5) * 20
  return Math.round(visitsScore + closingScore + punctualityScore + csatScore)
}

export async function createLoyaltyEvaluation(payload: CreateLoyaltyEvaluation) {
  const total_points = payload.total_points ?? calculateLoyaltyPoints(payload)
  const { data, error } = await supabase
    .from('loyalty_evaluations')
    .upsert([{ ...payload, total_points }], { onConflict: 'employee_id,period_month' })
    .select('*')
    .single()
  if (error) throw error
  return data as LoyaltyEvaluation
}

export async function getLoyaltyEvaluationsByPeriod(periodMonth: string) {
  const { data, error } = await supabase
    .from('loyalty_evaluations')
    .select('*')
    .eq('period_month', periodMonth)
    .order('total_points', { ascending: false })
  if (error) throw error
  return data as LoyaltyEvaluation[]
}

export async function getLoyaltyLeaderboard(periodMonth: string) {
  const { data, error } = await supabase
    .from('loyalty_leaderboard_monthly')
    .select('*')
    .eq('period_month', periodMonth)
    .order('points', { ascending: false })
  if (error) throw error
  return data as LoyaltyLeaderboardRow[]
}


