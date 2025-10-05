import { NextRequest, NextResponse } from 'next/server'
import { createSampleAlerts, clearAllAlerts } from '@/lib/sample-alerts'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'create') {
      const alerts = await createSampleAlerts()
      return NextResponse.json({ 
        success: true, 
        message: 'Sample alerts created successfully',
        data: alerts 
      })
    } else if (action === 'clear') {
      await clearAllAlerts()
      return NextResponse.json({ 
        success: true, 
        message: 'All alerts cleared successfully' 
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create" or "clear"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in sample alerts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
