import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'active'
    const severity = searchParams.get('severity')
    const alertType = searchParams.get('alertType')

    // Build query
    let query = supabase
      .from('unified_alerts_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (alertType) {
      query = query.eq('alert_type', alertType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in alerts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      alert_id,
      alert_type = 'system',
      category = 'general',
      severity = 'medium',
      priority = 'medium',
      title,
      message,
      description,
      status = 'active',
      visit_id,
      delegate_id,
      delegate_name,
      delegate_phone,
      delegate_email,
      customer_id,
      customer_name,
      customer_address,
      vehicle_id,
      vehicle_plate,
      driver_name,
      driver_phone,
      location,
      scheduled_time,
      actual_time,
      delay_minutes,
      grace_period_minutes = 10,
      escalation_threshold_minutes = 30,
      escalation_level = 'initial',
      notify_admins = true,
      notify_supervisors = false,
      send_push_notification = true,
      send_email_notification = false,
      send_sms_notification = false,
      metadata = {},
      tags = [],
      source_system,
      created_by,
      assigned_to,
      expires_at
    } = body

    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .insert({
        alert_id,
        alert_type,
        category,
        severity,
        priority,
        title,
        message,
        description,
        status,
        visit_id,
        delegate_id,
        delegate_name,
        delegate_phone,
        delegate_email,
        customer_id,
        customer_name,
        customer_address,
        vehicle_id,
        vehicle_plate,
        driver_name,
        driver_phone,
        location,
        scheduled_time,
        actual_time,
        delay_minutes,
        grace_period_minutes,
        escalation_threshold_minutes,
        escalation_level,
        notify_admins,
        notify_supervisors,
        send_push_notification,
        send_email_notification,
        send_sms_notification,
        metadata,
        tags,
        source_system,
        created_by,
        assigned_to,
        expires_at
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating alert:', error)
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in create alert API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
