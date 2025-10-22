# Módulo de Relatórios - AirPlus AAMS

## Workflow em 5 Etapas

### 1. Informações Básicas
- Selecionar serviço (service_id)
- Selecionar aeronave (aircraft_id)
- Selecionar turno (shift_id)
- Data do serviço
- Observações gerais

### 2. Equipa
- Lista de funcionários do turno
- Marcar presentes/ausentes
- Justificação de faltas

### 3. Fotos
- Upload fotos "antes" (mínimo 1)
- Upload fotos "depois" (mínimo 1)
- Descrição opcional

### 4. Assinaturas
- Assinatura supervisor (obrigatória)
- Assinatura cliente (obrigatória)
- Assinaturas adicionais

### 5. Revisão e Publicação
- Preview completo
- Gerar PDF
- Publicar (status = 'publicado')

## Schema Principal

```sql
CREATE TABLE service_reports (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  aircraft_id UUID REFERENCES aircraft(id),
  shift_id UUID REFERENCES shifts(id),
  client_id UUID REFERENCES clients(id),
  service_date TIMESTAMPTZ,
  observacoes TEXT,
  checklist JSONB,
  status report_status DEFAULT 'rascunho',
  supervisor_id UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Regras Críticas

1. **Imutabilidade**: Relatórios publicados não podem ser editados
2. **Validação Mínima**: 1 foto antes + 1 foto depois + 2 assinaturas
3. **PDF Automático**: Gerado client-side ao publicar
4. **Auditoria**: Todas as operações são registradas

---

**Última Atualização**: 2025-10-22
