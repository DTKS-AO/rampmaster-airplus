import { useState } from 'react';
import { toast } from 'sonner';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatUserRole } from '@/lib/utils/format';
import type { Tables } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;

interface ExportEmployeeProps {
  data: Employee[];
}

export function ExportEmployee({ data }: ExportEmployeeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Filter data
      const employeesToExport = includeInactive 
        ? data 
        : data.filter(emp => emp.ativo);

      // Prepare CSV data
      const headers = [
        'Nome',
        'BI',
        'Nº Mecanográfico',
        'Email',
        'Telefone',
        'Função',
        'Status',
      ];

      const rows = employeesToExport.map(emp => [
        emp.nome,
        emp.bi,
        emp.numero_mecanografico,
        emp.email,
        emp.telefone,
        formatUserRole(emp.funcao),
        emp.ativo ? 'Ativo' : 'Inativo'
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `funcionarios-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Dados exportados com sucesso');
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Funcionários</DialogTitle>
          <DialogDescription>
            Exportar lista de funcionários em formato CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="inactive">Incluir Inativos</Label>
            <Switch
              id="inactive"
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>O arquivo exportado incluirá:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Nome completo</li>
              <li>Número do BI</li>
              <li>Número mecanográfico</li>
              <li>Email e telefone</li>
              <li>Função atual</li>
              <li>Status (ativo/inativo)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Exportar {data.length} funcionário{data.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}