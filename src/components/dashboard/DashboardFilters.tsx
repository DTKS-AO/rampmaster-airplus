import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { DashboardFilters } from '@/types/dashboard'
import { Tables } from '@/integrations/supabase/types'

interface FilterProps {
  filters: DashboardFilters
  onFilterChange: (filters: DashboardFilters) => void
  showClientFilter?: boolean // Only show for AirPlus dashboard
}

export function DashboardFilters({ filters, onFilterChange, showClientFilter = false }: FilterProps) {
  const [date, setDate] = useState<Date | undefined>(filters.startDate)

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setDate(date)
    onFilterChange({
      ...filters,
      startDate: date,
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0) // Last day of selected month
    })
  }

  const handleServiceTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      serviceType: value as Tables<'service_reports'>['service_type']
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-wrap gap-4 pt-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'MMMM yyyy') : 'Selecione o mês'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select 
          value={filters.serviceType} 
          onValueChange={handleServiceTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de Serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="cleaning">Limpeza</SelectItem>
            <SelectItem value="boarding">Embarque</SelectItem>
          </SelectContent>
        </Select>

        {showClientFilter && (
          <Select 
            value={filters.clientId} 
            onValueChange={(value) => onFilterChange({ ...filters, clientId: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {/* Client list will be populated from API */}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  )
}