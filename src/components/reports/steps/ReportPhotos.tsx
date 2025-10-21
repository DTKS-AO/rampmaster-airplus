import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useUploadReportPhoto } from '@/hooks/queries/useReport';
import { toast } from 'sonner';
import { ImagePlusIcon, Trash2Icon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ReportPhotosProps {
  report: any;
  isPublished: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function ReportPhotos({
  report,
  isPublished,
  onNext,
  onPrevious,
}: ReportPhotosProps) {
  const uploadPhoto = useUploadReportPhoto();
  const [activeTab, setActiveTab] = useState('antes');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const beforePhotos = report.report_photos?.filter(
    (p: any) => p.tipo === 'antes'
  ) || [];
  const afterPhotos = report.report_photos?.filter(
    (p: any) => p.tipo === 'depois'
  ) || [];

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      await uploadPhoto.mutateAsync({
        file,
        reportId: report.id,
        tipo: activeTab as 'antes' | 'depois',
        ordem: activeTab === 'antes' ? beforePhotos.length + 1 : afterPhotos.length + 1,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      toast.error('Erro ao enviar foto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('report_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
    } catch (error) {
      toast.error('Erro ao excluir foto');
    }
  };

  const handleNext = () => {
    const requiredPhotos = 3; // Minimum photos required for each stage
    if (beforePhotos.length < requiredPhotos || afterPhotos.length < requiredPhotos) {
      toast.error(`São necessárias pelo menos ${requiredPhotos} fotos antes e depois`);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="antes">Antes do Serviço</TabsTrigger>
          <TabsTrigger value="depois">Depois do Serviço</TabsTrigger>
        </TabsList>

        <TabsContent value="antes">
          <Card>
            <CardHeader>
              <CardTitle>Fotos Antes do Serviço</CardTitle>
              <CardDescription>
                Tire fotos da aeronave antes de iniciar o serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {beforePhotos.map((photo: any) => (
                  <div
                    key={photo.id}
                    className="relative aspect-video rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={`Foto ${photo.ordem}`}
                      className="object-cover w-full h-full"
                    />
                    {!isPublished && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {!isPublished && (
                  <div
                    className={cn(
                      "aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <ImagePlusIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para adicionar foto
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depois">
          <Card>
            <CardHeader>
              <CardTitle>Fotos Depois do Serviço</CardTitle>
              <CardDescription>
                Tire fotos da aeronave após a conclusão do serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {afterPhotos.map((photo: any) => (
                  <div
                    key={photo.id}
                    className="relative aspect-video rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={`Foto ${photo.ordem}`}
                      className="object-cover w-full h-full"
                    />
                    {!isPublished && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {!isPublished && (
                  <div
                    className={cn(
                      "aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <ImagePlusIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para adicionar foto
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handlePhotoUpload}
        disabled={isLoading}
      />

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