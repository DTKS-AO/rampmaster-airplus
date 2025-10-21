import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/reports/ReportsTable';
import { columns } from '@/components/reports/ReportsColumns';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useReportList } from '@/hooks/queries/useReport';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    status?: 'rascunho' | 'publicado';
    clientId?: string;
    aircraftId?: string;
    shiftId?: string;
    startDate?: Date;
    endDate?: Date;
  }>();

  const { data: reports, isLoading } = useReportList(filters);

  return (
    <MainLayout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Gerencie os relatórios de serviço de limpeza e embarque/desembarque
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate('/reports/new')}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Relatório
          </Button>
        </div>
      </div>
      
      <ReportFilters 
        filters={filters} 
        onFilterChange={setFilters} 
      />

      <DataTable 
        columns={columns} 
        data={reports || []} 
        isLoading={isLoading}
      />
    </MainLayout>
  );
}