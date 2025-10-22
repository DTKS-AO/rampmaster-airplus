import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, FileText, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useDeleteReport } from '@/hooks/queries/useReport';
import { toast } from 'sonner';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <span className="font-mono">#{row.getValue('id')}</span>;
    },
  },
  {
    accessorKey: 'service_type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('service_type');
      return type === 'cleaning' ? 'Limpeza' : 'Embarque/Desembarque';
    },
  },
  {
    accessorKey: 'aircraft',
    header: 'Aeronave',
    cell: ({ row }) => {
      const aircraft = row.getValue('aircraft') as any;
      return aircraft?.matricula;
    },
  },
  {
    accessorKey: 'client',
    header: 'Cliente',
    cell: ({ row }) => {
      const client = row.getValue('client') as any;
      return client?.nome;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      return format(new Date(row.getValue('created_at')), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status');
      return (
        <Badge variant={status === 'rascunho' ? 'secondary' : 'default'}>
          {status === 'rascunho' ? 'Rascunho' : 'Publicado'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const deleteReport = useDeleteReport();
      const report = row.original;

      const handleDelete = async () => {
        try {
          await deleteReport.mutateAsync(report.id);
        } catch (error) {
          toast.error('Erro ao excluir relatório');
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/reports/${report.id}`)}>
              <FileText className="mr-2 h-4 w-4" />
              Ver Relatório
            </DropdownMenuItem>
            {report.status === 'rascunho' && (
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];