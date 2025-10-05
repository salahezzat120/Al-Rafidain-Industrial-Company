import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { action, alertId, userId } = body

    let updateData: any = {}

    switch (action) {
      case 'mark_read':
        updateData = {
          is_read: true,
          updated_at: new Date().toISOString()
        }
        break

      case 'mark_unread':
        updateData = {
          is_read: false,
          updated_at: new Date().toISOString()
        }
        break

      case 'resolve':
        updateData = {
          is_resolved: true,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          updated_at: new Date().toISOString()
        }
        break

      case 'dismiss':
        updateData = {
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
          dismissed_by: userId,
          updated_at: new Date().toISOString()
        }
        break

      case 'escalate':
        updateData = {
          escalation_level: 'escalated',
          escalation_count: supabase.raw('escalation_count + 1'),
          last_escalated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        break

      case 'acknowledge':
        updateData = {
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single()

    if (error) {
      console.error('Error performing alert action:', error)
      return NextResponse.json(
        { error: 'Failed to perform action' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in alert action API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
