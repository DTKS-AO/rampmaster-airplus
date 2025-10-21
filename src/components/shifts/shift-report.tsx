import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

// We'll use jspdf and jspdf-autotable for PDF generation
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type ShiftWithEmployees = Tables<'shifts'> & {
  supervisor?: Tables<'employees'>;
  shift_employees?: Array<{
    employee?: Tables<'employees'>;
    presente: boolean;
    justificativa?: string | null;
  }>;
};

interface ShiftReportProps {
  shift: ShiftWithEmployees;
}

export function ShiftReport({ shift }: ShiftReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateStatistics = () => {
    const totalEmployees = shift.shift_employees?.length ?? 0;
    const presentEmployees = shift.shift_employees?.filter(se => se.presente).length ?? 0;
    const attendanceRate = totalEmployees ? (presentEmployees / totalEmployees) * 100 : 0;

    return {
      totalEmployees,
      presentEmployees,
      attendanceRate: Math.round(attendanceRate),
    };
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const stats = calculateStatistics();

      // Header
      doc.setFontSize(20);
      doc.text('Relatório de Turno', 15, 20);

      // Shift Info
      doc.setFontSize(12);
      doc.text(`Turno: ${shift.nome}`, 15, 35);
      doc.text(
        `Data: ${format(new Date(shift.data_inicio), "d 'de' MMMM 'de' yyyy", {
          locale: ptBR,
        })}`,
        15,
        45
      );
      doc.text(
        `Horário: ${format(new Date(shift.data_inicio), 'HH:mm')} - ${format(
          new Date(shift.data_fim),
          'HH:mm'
        )}`,
        15,
        55
      );
      doc.text(
        `Supervisor: ${shift.supervisor?.nome ?? 'Não definido'}`,
        15,
        65
      );
      doc.text(`Status: ${shift.status === 'ativo' ? 'Ativo' : 'Encerrado'}`, 15, 75);

      // Statistics
      doc.setFontSize(14);
      doc.text('Estatísticas', 15, 90);
      doc.setFontSize(12);
      doc.text(`Total de Funcionários: ${stats.totalEmployees}`, 15, 100);
      doc.text(`Presentes: ${stats.presentEmployees}`, 15, 110);
      doc.text(`Taxa de Presença: ${stats.attendanceRate}%`, 15, 120);

      // Attendance Table
      const tableData = shift.shift_employees?.map(se => [
        se.employee?.nome ?? '',
        se.employee?.funcao ?? '',
        se.presente ? 'Presente' : 'Ausente',
        se.justificativa ?? '',
      ]) ?? [];

      doc.autoTable({
        startY: 130,
        head: [['Funcionário', 'Função', 'Presença', 'Justificativa']],
        body: tableData,
        styles: {
          fontSize: 10,
        },
        headStyles: {
          fillColor: [66, 66, 66],
        },
      });

      // Footer with timestamp
      const timestamp = format(new Date(), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Gerado em ${timestamp}`,
          15,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Save the PDF
      const fileName = `turno-${shift.id}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(fileName);
      toast.success('Relatório gerado com sucesso');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCSV = () => {
    try {
      const headers = ['Funcionário', 'Função', 'Presença', 'Justificativa'];
      const rows = shift.shift_employees?.map(se => [
        se.employee?.nome ?? '',
        se.employee?.funcao ?? '',
        se.presente ? 'Presente' : 'Ausente',
        se.justificativa ?? '',
      ]) ?? [];

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        'download',
        `turno-${shift.id}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV gerado com sucesso');
    } catch (error) {
      console.error('CSV generation error:', error);
      toast.error('Erro ao gerar CSV');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Printer className="mr-2 h-4 w-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={generatePDF}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}