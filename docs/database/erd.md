# Database Schema Documentation

## Entity Relationship Diagram

```mermaid
erDiagram
    clients ||--o{ aircraft : owns
    clients ||--o{ profiles : has
    clients ||--o{ user_roles : associates
    auth.users ||--|| profiles : has
    auth.users ||--o{ user_roles : has
    auth.users ||--o{ employees : links
    employees ||--o{ shifts : supervises
    employees ||--o{ teams : supervises
    shifts ||--o{ shift_employees : includes
    teams ||--o{ team_employees : includes
    employees ||--o{ shift_employees : participates
    employees ||--o{ team_employees : joins
    shifts ||--o{ teams : has

    clients {
        UUID id PK
        TEXT nome
        TEXT codigo
        TEXT email
        TEXT telefone
        TEXT logo_url
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        UUID created_by FK
        UUID updated_by FK
    }

    profiles {
        UUID id PK "References auth.users"
        TEXT full_name
        TEXT email
        TEXT telefone
        TEXT foto_url
        UUID client_id FK
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    user_roles {
        UUID id PK
        UUID user_id FK
        user_role role "ENUM"
        UUID client_id FK
        TIMESTAMPTZ created_at
        UUID created_by FK
    }

    employees {
        UUID id PK
        UUID user_id FK
        TEXT nome
        TEXT bi "Bilhete de Identidade"
        TEXT numero_mecanografico
        TEXT telefone
        TEXT email
        user_role funcao "ENUM"
        TEXT foto_url
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        UUID created_by FK
        UUID updated_by FK
    }

    aircraft {
        UUID id PK
        TEXT matricula
        TEXT modelo
        UUID client_id FK
        aircraft_status estado "ENUM"
        TIMESTAMPTZ ultima_limpeza
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        UUID created_by FK
        UUID updated_by FK
    }

    shifts {
        UUID id PK
        TEXT nome
        TIMESTAMPTZ data_inicio
        TIMESTAMPTZ data_fim
        UUID supervisor_id FK
        shift_status status "ENUM"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        UUID created_by FK
        UUID updated_by FK
    }

    teams {
        UUID id PK
        TEXT nome
        UUID supervisor_id FK
        UUID shift_id FK
        INT semana_referencia "1-52"
        INT mes_referencia "1-12"
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        UUID created_by FK
        UUID updated_by FK
    }

    shift_employees {
        UUID id PK
        UUID shift_id FK
        UUID employee_id FK
        BOOLEAN presente
        TEXT justificativa
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    team_employees {
        UUID id PK
        UUID team_id FK
        UUID employee_id FK
        TIMESTAMPTZ created_at
    }

    audit_logs {
        UUID id PK
        UUID user_id FK
        TEXT action
        TEXT table_name
        UUID record_id
        JSONB old_values
        JSONB new_values
        TEXT ip_address
        TIMESTAMPTZ created_at
    }
```

## Enums

### user_role
- super_admin
- gestor
- supervisor
- tecnico
- auxiliar
- cliente

### aircraft_status
- ativo
- em_manutencao
- inativo

### shift_status
- ativo
- encerrado

## Row Level Security (RLS) Policies

### Clients
- View: All authenticated users
- Insert/Update: Admins and managers only
- Delete: Admins only

### Profiles
- View: All authenticated users
- Update: Own profile only

### User Roles
- View: All authenticated users
- Manage: Super admins only

### Employees
- View: AirPlus staff (admin, manager, supervisor) and self
- Insert/Update: Admins and managers only
- Delete: Admins only

### Aircraft
- View: Owner client and AirPlus staff
- Insert/Update: Admins and managers only
- Delete: Admins only

### Shifts
- View: AirPlus staff
- Insert: Admins and managers only
- Update: Managers and supervisors
- Delete: Admins only

### Teams
- View: AirPlus staff
- Manage: Admins and managers only

### Shift Employees
- View: AirPlus staff
- Manage: Supervisors and above

### Team Employees
- View: AirPlus staff
- Manage: Admins and managers only

### Audit Logs
- View: Admins only

## Special Functions

### Triggers
1. `update_updated_at_column()`
   - Updates `updated_at` timestamp on record changes
   - Applied to: clients, profiles, employees, aircraft, shifts, teams

2. `handle_new_user()`
   - Auto-creates profile when new auth.user is created
   - Sets initial profile data from auth metadata

3. `auto_assign_super_admin()`
   - Assigns super_admin role to first user in system
   - Ensures system always has at least one admin

### Helper Functions
1. `has_role(user_id UUID, role user_role)`
   - Checks if user has specific role

2. `is_admin_or_manager(user_id UUID)`
   - Checks if user is super_admin or gestor

## Indices
- aircraft: client_id, matricula
- employees: numero_mecanografico, email
- shifts: data_inicio, data_fim
- user_roles: user_id, role
- audit_logs: user_id, table_name

## Data Protection
- All tables have RLS enabled
- Audit logging for all critical operations
- Multi-tenant isolation via client_id
- Role-based access control
- Automatic timestamps and user tracking