import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/auth';
import { useServices, useToggleService } from '@/hooks/queries/useServices';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusIcon, SparklesIcon } from 'lucide-react';
import { ServiceForm } from '@/components/services/ServiceForm';

const categoryLabels: Record<string, string> = {
  limpeza: 'Limpeza',
  rampa: 'Rampa',
  formacao: 'Formação',
  gestao: 'Gestão',
  manutencao: 'Manutenção',
};

const categoryColors: Record<string, string> = {
  limpeza: 'bg-blue-500',
  rampa: 'bg-amber-500',
  formacao: 'bg-green-500',
  gestao: 'bg-purple-500',
  manutencao: 'bg-red-500',
};

export default function Services() {
  const { user } = useAuth();
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  
  const { data: services, isLoading } = useServices(showInactive);
  const toggleService = useToggleService();

  const isAdmin = user?.role === 'super_admin';

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleService.mutateAsync({ id, ativo: !currentStatus });
  };

  if (!user) return null;

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-primary" />
              Serviços AirPlus
            </h2>
            <p className="text-muted-foreground">
              Catálogo oficial de serviços prestados pela AirPlus Services Angola
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-inactive"
                    checked={showInactive}
                    onCheckedChange={setShowInactive}
                  />
                  <label htmlFor="show-inactive" className="text-sm">
                    Mostrar inativos
                  </label>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Novo Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Serviço</DialogTitle>
                      <DialogDescription>
                        Adicione um novo serviço ao catálogo da AirPlus
                      </DialogDescription>
                    </DialogHeader>
                    <ServiceForm
                      onSuccess={() => setIsCreateDialogOpen(false)}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Services by Category */}
        {isLoading ? (
          <div className="text-center py-12">Carregando serviços...</div>
        ) : (
          <div className="grid gap-6">
            {Object.entries(
              (services as any[])?.reduce((acc, service) => {
                const cat = service.categoria;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(service);
                return acc;
              }, {} as Record<string, any[]>) || {}
            ).map(([categoria, categoryServices]) => (
              <Card key={categoria}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[categoria]}`} />
                    {categoryLabels[categoria] || categoria}
                  </CardTitle>
                  <CardDescription>
                    {(categoryServices as any[])?.length || 0} serviços disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Serviço</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-center">Mín. Técnicos</TableHead>
                        <TableHead className="text-center">Supervisor</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(categoryServices as any[])?.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.nome}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {service.codigo}
                            </code>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-md">
                            {service.descricao}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{service.minimo_tecnicos}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {service.requer_supervisor ? (
                              <Badge>Sim</Badge>
                            ) : (
                              <Badge variant="secondary">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={service.ativo ? 'default' : 'secondary'}>
                              {service.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingService(service)}
                                >
                                  Editar
                                </Button>
                                <Switch
                                  checked={service.ativo}
                                  onCheckedChange={() =>
                                    handleToggleStatus(service.id, service.ativo)
                                  }
                                />
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Serviço</DialogTitle>
              <DialogDescription>
                Atualize as informações do serviço
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              onSuccess={() => setEditingService(null)}
              onCancel={() => setEditingService(null)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
