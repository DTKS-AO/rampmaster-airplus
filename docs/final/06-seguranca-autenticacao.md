# Segurança e Autenticação - AirPlus AAMS

## Autenticação (Supabase Auth)

### Método
- Email/Password (principal)
- JWT tokens com refresh automático
- Session storage em localStorage

### Roles Hierárquicos

1. **super_admin**: Acesso total
2. **gestor**: Gestão operacional
3. **supervisor**: Criação de relatórios
4. **tecnico**: Visualização apenas
5. **cliente**: Dashboard read-only

## Row Level Security (RLS)

### Padrão
```sql
-- Todas as tabelas críticas têm RLS ativo
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

-- Policies baseadas em roles
CREATE POLICY "..." ON <table>
USING (is_admin_or_manager(auth.uid()) OR ...);
```

### Funções Helper
- `has_role(user_id, role)`: Verifica role específica
- `is_admin_or_manager(user_id)`: Verifica admin/gestor

## Storage Policies

Buckets: `photos`, `signatures`, `logos`, `avatars`

Políticas:
- Upload: Apenas AirPlus staff
- View: Baseado em client_id (RLS)

## Auditoria

Tabela `audit_logs`:
- user_id, action, table_name, record_id
- old_values, new_values (JSONB)
- ip_address, timestamp

Trigger automático em todas as tabelas críticas.

---

**Última Atualização**: 2025-10-22
