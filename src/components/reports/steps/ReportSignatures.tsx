import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useUploadSignature } from '@/hooks/queries/useReport';
import { toast } from 'sonner';
import SignaturePad from 'react-signature-canvas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ReportSignaturesProps {
  report: any;
  isPublished: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function ReportSignatures({
  report,
  isPublished,
  onNext,
  onPrevious,
}: ReportSignaturesProps) {
  const uploadSignature = useUploadSignature();
  const [isLoading, setIsLoading] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const signaturePadRef = useRef<SignaturePad>(null);

  const handleSaveSignature = async () => {
    if (!currentName || !currentRole) {
      toast.error('Preencha nome e cargo');
      return;
    }

    if (!signaturePadRef.current?.isEmpty()) {
      try {
        setIsLoading(true);
        
        const signatureDataUrl = signaturePadRef.current?.getTrimmedCanvas().toDataURL('image/png');
        
        await uploadSignature.mutateAsync({
          signature: signatureDataUrl,
          reportId: report.id,
          nome: currentName,
          cargo: currentRole,
        });

        // Clear form
        setCurrentName('');
        setCurrentRole('');
        signaturePadRef.current?.clear();

      } catch (error) {
        toast.error('Erro ao salvar assinatura');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Assinatura em branco');
    }
  };

  const handleDeleteSignature = async (signatureId: string) => {
    try {
      const { error } = await supabase
        .from('report_signatures')
        .delete()
        .eq('id', signatureId);

      if (error) throw error;
    } catch (error) {
      toast.error('Erro ao excluir assinatura');
    }
  };

  const handleNext = () => {
    const requiredSignatures = 2; // Minimum signatures required
    if ((report.report_signatures?.length || 0) < requiredSignatures) {
      toast.error(`São necessárias pelo menos ${requiredSignatures} assinaturas`);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assinaturas Coletadas</CardTitle>
            <CardDescription>
              Assinaturas dos responsáveis pelo serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.report_signatures?.map((signature: any) => (
                <div
                  key={signature.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{signature.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {signature.cargo}
                      </p>
                    </div>
                    {!isPublished && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSignature(signature.id)}
                      >
                        Remover
                      </Button>
                    )}
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

        {!isPublished && (
          <Card>
            <CardHeader>
              <CardTitle>Nova Assinatura</CardTitle>
              <CardDescription>
                Colete uma nova assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Nome completo"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input
                    placeholder="Cargo ou função"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assinatura</Label>
                  <div className="border rounded-lg bg-white">
                    <SignaturePad
                      ref={signaturePadRef}
                      canvasProps={{
                        className: 'w-full aspect-[3/1]',
                      }}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signaturePadRef.current?.clear()}
                    >
                      Limpar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveSignature}
                      disabled={isLoading}
                    >
                      Salvar Assinatura
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!isPublished && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onPrevious}>
            Voltar
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            Salvar e Continuar
          </Button>
        </div>
      )}
    </div>
  );
}