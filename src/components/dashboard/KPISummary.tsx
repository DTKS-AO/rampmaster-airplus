import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardKPIs } from '@/types/dashboard'

interface KPISummaryProps {
  kpis: DashboardKPIs
}

export function KPISummary({ kpis }: KPISummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.reports.total}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.reports.published} publicados, {kpis.reports.draft} rascunhos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.attendance.avgRate}%</div>
          <p className="text-xs text-muted-foreground">
            Média do período
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aeronaves Atendidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.aircraft.totalServiced}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.aircraft.avgServicesPerAircraft} serviços/aeronave
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.reports.avgTeamSize}</div>
          <p className="text-xs text-muted-foreground">
            Equipe média por serviço ({kpis.reports.avgServiceHours}h)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}