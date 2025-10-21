import { useState } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { KPISummary } from '@/components/dashboard/KPISummary'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { useDashboardKPIs, useDailyServiceStats } from '@/hooks/queries/useDashboard'
import type { DashboardFilters as Filters } from '@/types/dashboard'
import { useAuth } from '@/hooks/auth' // We need to create this hook
import { exportToXLS, exportToPDF } from '@/lib/exports'

// Initial filters state with current month
const initialFilters: Filters = {
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
  serviceType: undefined
}

export function ClientDashboard() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<Filters>({
    ...initialFilters,
    clientId: user?.client_id // Restrict to client's own data
  })
  
  const { data: kpis, isLoading: isLoadingKPIs } = useDashboardKPIs(filters)
  const { data: dailyStats, isLoading: isLoadingStats } = useDailyServiceStats(filters)

  // Handlers for exports
  const handleExportXLS = () => {
    if (!kpis || !dailyStats) return
    exportToXLS({ kpis, dailyStats }, filters)
  }

  const handleExportPDF = () => {
    if (!kpis || !dailyStats) return
    exportToPDF({ kpis, dailyStats }, filters)
  }

  if (isLoadingKPIs || isLoadingStats) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportXLS} variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export XLS
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <DashboardFilters 
        filters={filters} 
        onFilterChange={setFilters}
        showClientFilter={false} // Client only sees their own data
      />

      {kpis && <KPISummary kpis={kpis} />}
      {dailyStats && <DashboardCharts dailyStats={dailyStats} />}
    </div>
  )
}