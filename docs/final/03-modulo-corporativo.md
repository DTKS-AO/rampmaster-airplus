# Módulo Corporativo - AirPlus AAMS

## Visão Geral

O módulo corporativo estabelece a base organizacional da AirPlus Services Angola, definindo a estrutura da empresa, departamentos e os serviços oficiais prestados.

Este é o **módulo fundacional** do sistema - todos os outros módulos referenciam estas entidades.

## Entidades

### 1. Companies (Empresa)

**Propósito**: Armazenar dados institucionais da AirPlus Services Angola.

#### Schema

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  nif TEXT NOT NULL UNIQUE,
  morada_sede TEXT NOT NULL,
  morada_operacoes TEXT NOT NULL,
  telefone_principal TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Dados Oficiais (Seed)

```sql
INSERT INTO companies (
  nome,
  nif,
  morada_sede,
  morada_operacoes,
  telefone_principal,
  email,
  website,
  ativo
) VALUES (
  'AirPlus Services Angola',
  '5403048827',
  'Miramar, Luanda, Angola',
  'Aeroporto Dr. Agostinho Neto, Bela Vista, KM 44',
  '+244 933001002',
  'info@airplus.services',
  'https://www.airplus.services',
  true
);
```

#### TypeScript Interface

```typescript
interface Company {
  id: string;
  nome: string;
  nif: string;
  morada_sede: string;
  morada_operacoes: string;
  telefone_principal: string;
  email: string;
  website?: string;
  logo_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

#### RLS Policies

```sql
-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy 1: Todos podem visualizar a empresa ativa
CREATE POLICY "Company visible to all authenticated"
ON companies FOR SELECT
USING (ativo = true);

-- Policy 2: Apenas super_admin pode editar
CREATE POLICY "Only super_admin can update company"
ON companies FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::user_role));
```

#### API Hooks

```typescript
// src/hooks/queries/useServices.ts

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('ativo', true)
        .single();
      
      if (error) throw error;
      return data as Company;
    },
    staleTime: Infinity, // Dados raramente mudam
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Company>) => {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('ativo', true)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Dados da empresa atualizados!');
    },
  });
}
```

---

### 2. Departments (Departamentos)

**Propósito**: Organizar a estrutura interna da AirPlus em departamentos funcionais.

#### Schema

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Dados Oficiais (Seed)

```sql
INSERT INTO departments (nome, descricao) VALUES
('Operações', 'Gestão operacional, limpeza de aeronaves e serviços de pista'),
('Recursos Humanos', 'Gestão de pessoal, turnos, equipas e formação'),
('Comercial e Marketing', 'Gestão de clientes, contratos e relacionamento'),
('Administração', 'Controle de acessos, segurança e auditoria'),
('TI', 'Gestão técnica e manutenção do sistema AirPlus AAMS');
```

#### TypeScript Interface

```typescript
interface Department {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}
```

#### RLS Policies

```sql
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver
CREATE POLICY "Departments visible to authenticated"
ON departments FOR SELECT
USING (auth.role() = 'authenticated');

-- Apenas admins podem editar
CREATE POLICY "Only admins can manage departments"
ON departments FOR ALL
USING (has_role(auth.uid(), 'super_admin'::user_role));
```

#### API Hooks

```typescript
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Department[];
    },
  });
}
```

---

### 3. Services (Serviços Oficiais)

**Propósito**: Catalogar todos os serviços prestados pela AirPlus, servindo como base para relatórios e contratos.

#### Schema

```sql
-- Enum para categorias de serviço
CREATE TYPE service_category AS ENUM (
  'limpeza',
  'rampa',
  'gestão',
  'manutenção',
  'formação'
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  categoria service_category NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_categoria ON services(categoria);
CREATE INDEX idx_services_codigo ON services(codigo);

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Dados Oficiais (Seed)

```sql
INSERT INTO services (nome, codigo, categoria, descricao, ativo) VALUES

-- Categoria: Limpeza
('Limpeza Exterior de Aeronaves', 'limpeza_exterior', 'limpeza',
 'Serviço de lavagem, polimento e proteção externa da aeronave', true),

('Limpeza Interior de Aeronaves', 'limpeza_interior', 'limpeza',
 'Serviço de higienização, organização e desinfecção do interior', true),

('Limpeza Completa (Interior + Exterior)', 'limpeza_completa', 'limpeza',
 'Serviço integral de limpeza interna e externa da aeronave', true),

-- Categoria: Rampa
('Embarque e Desembarque', 'rampa', 'rampa',
 'Apoio operacional durante embarque e desembarque de passageiros', true),

('Assistência em Terra', 'ground_handling', 'rampa',
 'Gestão completa de serviços de pista, manobra e suporte operacional', true),

-- Categoria: Gestão
('Gestão de Tripulações', 'trip_management', 'gestão',
 'Coordenação e apoio logístico a tripulações em trânsito', true),

('Agência de Viagens Corporativa', 'travel_agency', 'gestão',
 'Planeamento e apoio logístico de viagens corporativas', true),

-- Categoria: Manutenção
('Fornecimento de Peças', 'supply_parts', 'manutenção',
 'Logística e fornecimento de peças e equipamentos técnicos', true),

-- Categoria: Formação
('Formação Aeronáutica', 'training', 'formação',
 'Treino técnico e de segurança operacional para equipas', true);
```

#### TypeScript Interface

```typescript
type ServiceCategory = 'limpeza' | 'rampa' | 'gestão' | 'manutenção' | 'formação';

interface Service {
  id: string;
  nome: string;
  codigo: string;
  categoria: ServiceCategory;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Para formulários
type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
type ServiceUpdate = Partial<ServiceInsert>;
```

#### RLS Policies

```sql
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy 1: Todos autenticados podem ver serviços ativos
CREATE POLICY "Services visible to authenticated"
ON services FOR SELECT
USING (ativo = true);

-- Policy 2: Apenas admins podem criar serviços
CREATE POLICY "Only admins can create services"
ON services FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

-- Policy 3: Apenas admins podem editar serviços
CREATE POLICY "Only admins can update services"
ON services FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

-- Policy 4: Soft delete - apenas desativa
CREATE POLICY "Only admins can deactivate services"
ON services FOR UPDATE
USING (
  is_admin_or_manager(auth.uid()) AND
  ativo = false
);
```

#### API Hooks

```typescript
// src/hooks/queries/useServices.ts

// Listar todos os serviços ativos
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data as Service[];
    },
  });
}

// Listar serviços por categoria
export function useServicesByCategory(categoria?: ServiceCategory) {
  return useQuery({
    queryKey: ['services', 'category', categoria],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (categoria) {
        query = query.eq('categoria', categoria);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!categoria,
  });
}

// Obter serviço por ID
export function useService(id: string) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Service;
    },
    enabled: !!id,
  });
}

// Criar serviço (apenas admin)
export function useCreateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newService: ServiceInsert) => {
      const { data, error } = await supabase
        .from('services')
        .insert(newService)
        .select()
        .single();
      
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar serviço: ${error.message}`);
    },
  });
}

// Atualizar serviço (apenas admin)
export function useUpdateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServiceUpdate }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço atualizado!');
    },
  });
}

// Soft delete - desativar serviço
export function useToggleService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data, error } = await supabase
        .from('services')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Status do serviço atualizado!');
    },
  });
}
```

## Componentes UI

### ServiceForm Component

```typescript
// src/components/services/ServiceForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const serviceSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  codigo: z.string()
    .min(3, 'Código obrigatório')
    .regex(/^[a-z_]+$/, 'Apenas letras minúsculas e underscore'),
  categoria: z.enum(['limpeza', 'rampa', 'gestão', 'manutenção', 'formação']),
  descricao: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: Service;
  onSuccess?: () => void;
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || {
      categoria: 'limpeza',
    },
  });
  
  const onSubmit = async (values: ServiceFormValues) => {
    if (service) {
      await updateMutation.mutateAsync({ id: service.id, updates: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    
    onSuccess?.();
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Serviço</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Limpeza Exterior" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: limpeza_exterior" />
              </FormControl>
              <FormDescription>
                Apenas letras minúsculas e underscore
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="limpeza">Limpeza</SelectItem>
                  <SelectItem value="rampa">Rampa</SelectItem>
                  <SelectItem value="gestão">Gestão</SelectItem>
                  <SelectItem value="manutenção">Manutenção</SelectItem>
                  <SelectItem value="formação">Formação</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {service ? 'Atualizar' : 'Criar'} Serviço
        </Button>
      </form>
    </Form>
  );
}
```

### Services List Page

```typescript
// src/pages/Services.tsx
import { useState } from 'react';
import { useServices, useToggleService } from '@/hooks/queries/useServices';
import { ServiceForm } from '@/components/services/ServiceForm';

export function Services() {
  const { data: services, isLoading } = useServices();
  const toggleMutation = useToggleService();
  const [selectedService, setSelectedService] = useState<Service>();
  const [showForm, setShowForm] = useState(false);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Serviços Oficiais</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>
      
      {/* Agrupados por categoria */}
      {['limpeza', 'rampa', 'gestão', 'manutenção', 'formação'].map(categoria => {
        const servicesByCategory = services?.filter(s => s.categoria === categoria);
        
        if (!servicesByCategory?.length) return null;
        
        return (
          <Card key={categoria} className="mb-6">
            <CardHeader>
              <CardTitle className="capitalize">{categoria}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesByCategory.map(service => (
                    <TableRow key={service.id}>
                      <TableCell>{service.nome}</TableCell>
                      <TableCell><code>{service.codigo}</code></TableCell>
                      <TableCell className="max-w-md truncate">
                        {service.descricao}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.ativo ? 'default' : 'secondary'}>
                          {service.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedService(service);
                              setShowForm(true);
                            }}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() =>
                              toggleMutation.mutate({ 
                                id: service.id, 
                                ativo: !service.ativo 
                              })
                            }>
                              {service.ativo ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Dialog para criar/editar */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedService ? 'Editar' : 'Novo'} Serviço
            </DialogTitle>
          </DialogHeader>
          <ServiceForm
            service={selectedService}
            onSuccess={() => {
              setShowForm(false);
              setSelectedService(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Integração com Outros Módulos

### Service Reports

O campo `tipo_servico` na tabela `service_reports` **foi substituído** por `service_id`:

```sql
-- Migration: Atualizar service_reports
ALTER TABLE service_reports
  DROP COLUMN tipo_servico,
  ADD COLUMN service_id UUID REFERENCES services(id) NOT NULL;

CREATE INDEX idx_service_reports_service ON service_reports(service_id);
```

Agora os relatórios referenciam diretamente o catálogo de serviços:

```typescript
// Ao criar relatório
const report = {
  service_id: 'uuid-do-servico',  // Ex: "limpeza_exterior"
  aircraft_id: 'uuid-do-aviao',
  shift_id: 'uuid-do-turno',
  // ...
};
```

### Dashboards

Os dashboards filtram por serviço oficial:

```typescript
// Dashboard filters
const filters = {
  serviceId: 'uuid-do-servico',  // Filtro por serviço específico
  clientId: 'uuid-do-cliente',
  startDate: new Date(),
  endDate: new Date(),
};
```

## Regras de Negócio

1. **Imutabilidade de Serviços Oficiais**
   - Os 9 serviços oficiais (seed) **não podem ser deletados**
   - Apenas podem ser desativados (`ativo = false`)
   - Código do serviço é **imutável** após criação

2. **Categorias Fixas**
   - As 5 categorias são fixas (enum `service_category`)
   - Não é possível criar novas categorias sem migration

3. **Soft Delete**
   - Serviços inativos permanecem na base de dados
   - Relatórios antigos continuam referenciando serviços inativos
   - Serviços inativos não aparecem em novos seletores

4. **Auditoria**
   - Todas as alterações em serviços geram logs em `audit_logs`
   - Campo `updated_by` rastreia quem fez a última alteração

5. **Permissões**
   - Apenas **super_admin** e **gestor** podem criar/editar serviços
   - Todos os utilizadores autenticados podem **visualizar** serviços ativos
   - Clientes externos veem apenas serviços nos seus relatórios

## Testes Recomendados

### Testes Unitários
```typescript
describe('Service Validation', () => {
  it('should reject invalid service code', () => {
    const invalidService = {
      nome: 'Teste',
      codigo: 'Invalid Code!', // Espaços e maiúsculas
      categoria: 'limpeza',
    };
    
    expect(() => serviceSchema.parse(invalidService)).toThrow();
  });
  
  it('should accept valid service', () => {
    const validService = {
      nome: 'Limpeza Teste',
      codigo: 'limpeza_teste',
      categoria: 'limpeza',
    };
    
    expect(() => serviceSchema.parse(validService)).not.toThrow();
  });
});
```

### Testes de Integração
```typescript
describe('Service CRUD', () => {
  it('should create service as admin', async () => {
    // Login como admin
    await supabase.auth.signInWithPassword({ 
      email: 'admin@airplus.services', 
      password: 'test' 
    });
    
    const { data, error } = await supabase
      .from('services')
      .insert({
        nome: 'Serviço Teste',
        codigo: 'servico_teste',
        categoria: 'limpeza',
      })
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(data.nome).toBe('Serviço Teste');
  });
  
  it('should reject service creation as client', async () => {
    // Login como cliente
    await supabase.auth.signInWithPassword({ 
      email: 'client@example.com', 
      password: 'test' 
    });
    
    const { error } = await supabase
      .from('services')
      .insert({
        nome: 'Serviço Teste',
        codigo: 'servico_teste',
        categoria: 'limpeza',
      });
    
    expect(error).not.toBeNull();
    expect(error.code).toBe('42501'); // Insufficient privileges
  });
});
```

---

**Última Atualização**: 2025-10-22  
**Responsável**: Equipe AirPlus TI  
**Versão do Documento**: 1.0
