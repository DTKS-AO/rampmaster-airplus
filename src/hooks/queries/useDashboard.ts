import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { DashboardKPIs, DashboardFilters, DailyServiceStats } from '@/types/dashboard'

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  kpis: (filters: DashboardFilters) => [...DASHBOARD_KEYS.all, 'kpis', filters] as const,
  dailyStats: (filters: DashboardFilters) => [...DASHBOARD_KEYS.all, 'dailyStats', filters] as const,
}

export const useDashboardKPIs = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.kpis(filters),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_kpis', {
        p_start_date: filters.startDate.toISOString(),
        p_end_date: filters.endDate.toISOString(),
        p_client_id: filters.clientId,
        p_service_type: filters.serviceType,
      })

      if (error) throw error
      return data as DashboardKPIs
    },
  })
}

export const useDailyServiceStats = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.dailyStats(filters),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_service_stats', {
        p_start_date: filters.startDate.toISOString(),
        p_end_date: filters.endDate.toISOString(),
        p_client_id: filters.clientId,
      })

      if (error) throw error
      return data as DailyServiceStats[]
    },
  })
}