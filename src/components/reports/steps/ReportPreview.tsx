import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpToLine, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { generateReportPDF } from '@/lib/pdf';
import { supabase } from '@/integrations/supabase/client';

interface ReportPreviewProps {
  report: any;
  isPublished: boolean;
  onPrevious: () => void;
}

export function ReportPreview({
  report,
  isPublished,
  onPrevious,
}: ReportPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    try {
      setIsLoading(true);

      // Validate required data
      if (!report.aircraft_id || !report.client_id || !report.shift_id) {
        throw new Error('Informações básicas incompletas');
      }

      if (!report.report_employees?.length) {
        throw new Error('Equipe não definida');
      }

      const beforePhotos = report.report_photos?.filter((p: any) => p.tipo === 'antes') || [];
      const afterPhotos = report.report_photos?.filter((p: any) => p.tipo === 'depois') || [];
      if (beforePhotos.length < 3 || afterPhotos.length < 3) {
        throw new Error('Mínimo de 3 fotos antes e depois necessário');
      }

      if ((report.report_signatures?.length || 0) < 2) {
        throw new Error('Mínimo de 2 assinaturas necessário');
      }

      // Update report status
      const { error } = await (supabase
        .from('service_reports') as any)
        .update({ status: 'publicado' })
        .eq('id', report.id);

      if (error) throw error;

      // Generate PDF
      await generateReportPDF(report);

      toast.success('Relatório publicado com sucesso');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao publicar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async (report: any) => {
    try {
      setIsLoading(true);
      await generateReportPDF(report);
      toast.success('PDF gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error('PDF generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tipo de Serviço
                </dt>
                <dd className="text-sm">
                  {report.service_type === 'cleaning'
                    ? 'Limpeza'
                    : 'Embarque/Desembarque'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Data do Serviço
                </dt>
                <dd className="text-sm">
                  {format(new Date(report.service_date), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Aeronave
                </dt>
                <dd className="text-sm">{report.aircraft?.registration}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Cliente
                </dt>
                <dd className="text-sm">{report.client?.name}</dd>
              </div>
              {report.notes && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Observações
                  </dt>
                  <dd className="text-sm">{report.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.report_employees?.map((emp: any) => (
                <div
                  key={emp.id}
                  className="flex justify-between items-center py-2"
                >
                  <div>
                    <p className="font-medium">
                      {emp.employee?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {emp.role === 'supervisor'
                        ? 'Supervisor'
                        : emp.role === 'tecnico'
                        ? 'Técnico'
                        : 'Auxiliar'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {emp.hours_worked}h
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Antes do Serviço</h4>
                <div className="grid grid-cols-3 gap-2">
                  {report.report_photos
                    ?.filter((p: any) => p.tipo === 'antes')
                    .map((photo: any) => (
                      <div
                        key={photo.id}
                        className="aspect-video rounded-lg overflow-hidden"
                      >
                        <img
                          src={photo.url}
                          alt={`Foto ${photo.ordem}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Depois do Serviço</h4>
                <div className="grid grid-cols-3 gap-2">
                  {report.report_photos
                    ?.filter((p: any) => p.tipo === 'depois')
                    .map((photo: any) => (
                      <div
                        key={photo.id}
                        className="aspect-video rounded-lg overflow-hidden"
                      >
                        <img
                          src={photo.url}
                          alt={`Foto ${photo.ordem}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.report_signatures?.map((signature: any) => (
                <div
                  key={signature.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div>
                    <p className="font-medium">{signature.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {signature.cargo}
                    </p>
                  </div>
                  <div className="aspect-[3/1] relative rounded border overflow-hidden">
                    <img
                      src={signature.assinatura_url}
                      alt={`Assinatura de ${signature.nome}`}
                      className="object-contain w-full h-full bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        {!isPublished && (
          <>
            <Button variant="outline" onClick={onPrevious}>
              Voltar
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowUpToLine className="mr-2 h-4 w-4" />
              Publicar Relatório
            </Button>
          </>
        )}
        {isPublished && (
          <Button
            onClick={() => handleGeneratePDF(report)}
            disabled={isLoading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        )}
      </div>
    </div>
  );
}