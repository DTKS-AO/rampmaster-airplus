import { Tables } from '@/integrations/supabase/types'

export interface DashboardFilters {
  startDate: Date
  endDate: Date
  clientId?: string
  serviceType?: Tables<'service_reports'>['service_type']
}

export interface DashboardKPIs {
  reports: {
    total: number
    published: number
    draft: number
    avgTeamSize: number
    avgServiceHours: number
  }
  attendance: {
    avgRate: number
  }
  aircraft: {
    totalServiced: number
    avgServicesPerAircraft: number
  }
}

export interface DailyServiceStats {
  date: string
  totalServices: number
  cleaningServices: number
  boardingServices: number
  uniqueAircrafts: number
  avgTeamSize: number
}

// Chart types for Recharts
export type ChartData = {
  name: string
  value: number
  [key: string]: string | number // For additional series
}

export type ServiceTypeDistribution = ChartData & {
  cleaning: number
  boarding: number
}

export type StatusDistribution = ChartData & {
  published: number
  draft: number
}

export type TeamProductivity = ChartData & {
  avgTeamSize: number
  avgServiceHours: number
}

export type AttendanceRate = ChartData & {
  rate: number
  absentRate: number
}