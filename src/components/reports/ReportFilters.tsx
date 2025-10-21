import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportFiltersProps {
  filters: {
    status?: 'rascunho' | 'publicado';
    clientId?: string;
    aircraftId?: string;
    shiftId?: string;
    startDate?: Date;
    endDate?: Date;
  };
  onFilterChange: (filters: ReportFiltersProps['filters']) => void;
}

export function ReportFilters({ filters, onFilterChange }: ReportFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 my-4">
      <Select
        value={filters.status}
        onValueChange={(value: 'rascunho' | 'publicado' | undefined) =>
          onFilterChange({ ...filters, status: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rascunho">Rascunho</SelectItem>
          <SelectItem value="publicado">Publicado</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !filters.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? (
                format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Data inicial</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => onFilterChange({ ...filters, startDate: date })}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !filters.endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.endDate ? (
                format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Data final</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => onFilterChange({ ...filters, endDate: date })}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button 
        variant="ghost"
        onClick={() => onFilterChange({})}
      >
        Limpar filtros
      </Button>
    </div>
  );
}