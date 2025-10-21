import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Copy, Loader2, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface ShiftTemplateSelectProps {
  onSelect: (template: Tables<'shift_templates'> & {
    shift_template_employees: Array<{
      employee: Tables<'employees'>;
    }>;
  }) => void;
}

export function ShiftTemplateSelect({ onSelect }: ShiftTemplateSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['shift-templates', search],
    queryFn: async () => {
      let query = supabase
        .from('shift_templates')
        .select(
          `*,
          shift_template_employees(
            employee:employees(*)
          )`
        )
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('nome', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleSelect = (template: Tables<'shift_templates'> & {
    shift_template_employees: Array<{
      employee: Tables<'employees'>;
    }>;
  }) => {
    onSelect(template);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar Template</DialogTitle>
          <DialogDescription>
            Escolha um template para preencher automaticamente os detalhes do turno
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : templates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum template encontrado
                  </TableCell>
                </TableRow>
              ) : (
                templates?.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.nome}
                      {template.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {template.descricao}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {template.horario_inicio} - {template.horario_fim}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        {template.shift_template_employees?.length ?? 0}{' '}
                        funcionários
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(template.created_at),
                        "d 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSelect(template)}
                      >
                        Usar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}