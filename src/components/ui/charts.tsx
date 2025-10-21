import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-[300px]">
        {children}
      </CardContent>
    </Card>
  )
}

interface BarChartProps {
  data: any[]
  xKey: string
  yKey: string
  bars: Array<{
    key: string
    color: string
  }>
}

export function BarChartComponent({ data, xKey, yKey, bars }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map(({ key, color }) => (
          <Bar key={key} dataKey={key} fill={color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

interface LineChartProps {
  data: any[]
  xKey: string
  lines: Array<{
    key: string
    color: string
  }>
}

export function LineChartComponent({ data, xKey, lines }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map(({ key, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface PieChartProps {
  data: any[]
  nameKey: string
  valueKey: string
  colors: string[]
}

export function PieChartComponent({ data, nameKey, valueKey, colors }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}