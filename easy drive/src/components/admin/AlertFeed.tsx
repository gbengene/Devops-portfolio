'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Alert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  created_at: string
  vehicles?: { plate_number: string } | null
}

interface Props {
  alerts: Alert[]
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-50 border-red-300 text-red-800',
  warning:  'bg-amber-50 border-amber-300 text-amber-800',
  info:     'bg-blue-50 border-blue-200 text-blue-800',
}

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  warning:  'bg-amber-500',
  info:     'bg-blue-400',
}

export function AlertFeed({ alerts: initialAlerts }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const supabase = createClient()

  // Subscribe to new alerts via Supabase Realtime — no page refresh needed
  useEffect(() => {
    const channel = supabase
      .channel('alerts-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          setAlerts(prev => [payload.new as Alert, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  async function acknowledge(alertId: string) {
    await fetch(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' })
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Live Alerts</h2>
        {alerts.length > 0 && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            {alerts.length} unread
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {alerts.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No open alerts</p>
        )}
        {alerts.map(alert => (
          <div key={alert.id} className={`p-4 border-l-4 ${SEVERITY_STYLES[alert.severity]}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[alert.severity]}`} />
                <div>
                  {alert.vehicles && (
                    <span className="text-xs font-mono font-bold mr-2">
                      [{alert.vehicles.plate_number}]
                    </span>
                  )}
                  <span className="text-sm">{alert.message}</span>
                  <p className="text-xs opacity-60 mt-0.5">
                    {new Date(alert.created_at).toLocaleString('en-CA')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => acknowledge(alert.id)}
                className="text-xs text-gray-400 hover:text-gray-700 flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
