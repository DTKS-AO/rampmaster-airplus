import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReport } from '@/hooks/queries/useReport';
import { ReportBasicInfo } from '@/components/reports/steps/ReportBasicInfo';
import { ReportEmployees } from '@/components/reports/steps/ReportEmployees';
import { ReportPhotos } from '@/components/reports/steps/ReportPhotos';
import { ReportSignatures } from '@/components/reports/steps/ReportSignatures';
import { ReportPreview } from '@/components/reports/steps/ReportPreview';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const { data: report, isLoading } = useReport(id || '');

  const handleNext = () => {
    const tabs = ['info', 'employees', 'photos', 'signatures', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const tabs = ['info', 'employees', 'photos', 'signatures', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div>Carregando...</div>
      </MainLayout>
    );
  }

  if (!report) {
    toast.error('Relatório não encontrado');
    navigate('/reports');
    return null;
  }

  const isPublished = report.status === 'publicado';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {id === 'new' ? 'Novo Relatório' : `Relatório #${report.id}`}
          </h2>
          <p className="text-muted-foreground">
            {isPublished 
              ? 'Visualize os detalhes do relatório publicado'
              : 'Preencha as informações do relatório em 5 etapas'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">1. Informações</TabsTrigger>
            <TabsTrigger value="employees">2. Equipe</TabsTrigger>
            <TabsTrigger value="photos">3. Fotos</TabsTrigger>
            <TabsTrigger value="signatures">4. Assinaturas</TabsTrigger>
            <TabsTrigger value="preview">5. Revisão</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ReportBasicInfo 
              report={report} 
              isPublished={isPublished}
              onNext={handleNext}
            />
          </TabsContent>

          <TabsContent value="employees">
            <ReportEmployees
              report={report}
              isPublished={isPublished}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </TabsContent>

          <TabsContent value="photos">
            <ReportPhotos
              report={report}
              isPublished={isPublished}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </TabsContent>

          <TabsContent value="signatures">
            <ReportSignatures
              report={report}
              isPublished={isPublished}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </TabsContent>

          <TabsContent value="preview">
            <ReportPreview
              report={report}
              isPublished={isPublished}
              onPrevious={handlePrevious}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
          >
            Voltar
          </Button>

          <div className="space-x-2">
            {activeTab !== 'info' && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                Anterior
              </Button>
            )}
            {activeTab !== 'preview' && (
              <Button onClick={handleNext}>
                Próximo
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}