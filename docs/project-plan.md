# AirPlus AAMS - Sistema de Relatórios e Operações Aeronáuticas

## Visão Geral do Projeto

O AirPlus AAMS (Aircraft Activity Management System) é um sistema multi-tenant especializado em relatórios de limpeza de aeronaves e serviços de rampa para a AirPlus Angola. O sistema é projetado para ser online-only, mobile-first e instalável como PWA.

### Características Principais

- Multi-tenant com único prestador (AirPlus)
- Interface responsiva e PWA para uso em campo
- Relatórios com fotos e assinaturas obrigatórias
- Geração de PDFs no frontend
- Dashboards de KPIs por cliente
- Auditoria completa de operações

## Arquitetura Técnica

### Frontend

- **Framework**: React + Vite
- **Linguagem**: TypeScript (strict mode)
- **UI/Styling**: 
  - Tailwind CSS
  - shadcn/ui (Radix UI)
  - Layout mobile-first
- **Estado e Cache**:
  - TanStack Query (data fetching)
  - Zustand (state management)
- **Routing**: React Router
- **Features**:
  - PWA instalável (sem modo offline)
  - PDF generation client-side
  - Upload seguro de imagens
  - Validação de formulários

### Backend (Supabase)

- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (fotos/assinaturas)
- **Security**: Row Level Security (RLS)
- **API**: REST + Realtime subscriptions
- **Edge Functions**: Deno runtime (quando necessário)

### Qualidade e CI/CD

- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Deploy**: Netlify
  - Deploy automático
  - CDN global
  - SSL/TLS

## Módulos do Sistema

### 1. Operações

Gestão central de recursos da AirPlus:
- Aeronaves (por cliente)
- Funcionários
- Turnos
- Equipas

### 2. Relatórios

Workflow em 5 etapas:
1. Informação geral
2. Seleção de funcionários
3. Upload de fotos (antes/depois)
4. Assinaturas digitais
5. Revisão e exportação

### 3. Dashboards

- **AirPlus**: KPIs detalhados, análises, exports
- **Clientes**: KPIs básicos da sua frota

### 4. Configurações

- Tipos de serviço
- Branding por cliente
- Templates de relatório
- Permissões e papéis

## Papéis e Permissões

1. **Super Administrador** (AirPlus HQ)
   - Acesso total ao sistema
   - Gestão de clientes e configurações

2. **Gestor** (AirPlus)
   - Gestão de equipas e relatórios
   - Acesso a exports e edições

3. **Supervisor** (AirPlus)
   - Gestão de turno
   - Criação de relatórios

4. **Técnico/Auxiliar** (AirPlus)
   - Execução de serviços
   - Upload de fotos

5. **Cliente**
   - Visualização de relatórios próprios
   - Acesso a dashboards básicos

## Requisitos Não-Funcionais

### Performance
- Tempo de carregamento inicial < 2s
- Time to Interactive < 3s
- Optimização de imagens automática

### Segurança
- Autenticação Supabase
- RLS por tenant/role
- Uploads seguros
- Logs de auditoria

### Disponibilidade
- Uptime target: 99.9%
- Backup diário
- CDN global

### UX/UI
- Mobile-first
- Feedback visual imediato
- Modo claro/escuro
- Suporte offline limitado (PWA)

## Plano de Entregas

### Sprint 1: Documentação & Base
- [x] Documentação técnica
- [ ] ERD e RBAC
- [ ] API Specification
- [ ] Diagramas e fluxos

### Sprint 2: Operações
- [ ] CRUD Aeronaves
- [ ] CRUD Funcionários
- [ ] Gestão de Turnos
- [ ] Equipas

### Sprint 3: Relatórios
- [ ] Workflow 5 etapas
- [ ] Upload de fotos
- [ ] Assinaturas
- [ ] PDFs

### Sprint 4: Dashboards
- [ ] KPIs AirPlus
- [ ] KPIs Cliente
- [ ] Exports
- [ ] Filtros

### Sprint 5: Configurações
- [ ] Tipos de serviço
- [ ] Branding
- [ ] Templates
- [ ] Permissões

### Sprint 6: QA & Deploy
- [ ] Testes
- [ ] Security review
- [ ] Performance
- [ ] Deploy staging

## Considerações Específicas Angola

- Formato BI angolano
- Números de telefone locais
- Fuso horário WAT/WAST
- Português (pt-AO)
- Moeda: Kwanza (AOA)

## Próximos Passos

1. Finalizar ERD e documentação de banco
2. Definir RLS policies
3. Criar OpenAPI spec
4. Preparar diagramas de fluxo
5. Iniciar setup do projeto