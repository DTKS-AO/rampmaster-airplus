import { ChartCard, BarChartComponent, LineChartComponent, PieChartComponent } from '@/components/ui/charts'
import { DailyServiceStats } from '@/types/dashboard'

interface DashboardChartsProps {
  dailyStats: DailyServiceStats[]
}

export function DashboardCharts({ dailyStats }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
      <ChartCard title="Serviços por Dia">
        <LineChartComponent
          data={dailyStats}
          xKey="date"
          lines={[
            { key: 'totalServices', color: '#8884d8' },
          ]}
        />
      </ChartCard>

      <ChartCard title="Distribuição por Tipo">
        <BarChartComponent
          data={dailyStats}
          xKey="date"
          yKey="value"
          bars={[
            { key: 'cleaningServices', color: '#82ca9d' },
            { key: 'boardingServices', color: '#8884d8' },
          ]}
        />
      </ChartCard>

      <ChartCard title="Tamanho Médio das Equipes">
        <LineChartComponent
          data={dailyStats}
          xKey="date"
          lines={[
            { key: 'avgTeamSize', color: '#82ca9d' },
          ]}
        />
      </ChartCard>
    </div>
  )
}