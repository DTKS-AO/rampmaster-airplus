# Role-Based Access Control (RBAC)

## Roles Overview

### 1. Super Administrador (super_admin)
Top-level system administrator with complete access.

**Permissions:**
- user.*: Full system user management
- client.*: Full client management
- aircraft.*: Full aircraft management
- employee.*: Full employee management
- turno.*: Full shift management
- report.*: Full report management
- schedule.*: Full schedule management
- analytics.*: Full analytics access
- export.*: All export capabilities
- audit.*: Full audit log access
- system.*: System configuration access
- role.*: Role management
- permissions.*: Permission management

### 2. Gestor (gestor)
AirPlus operations manager with broad access but limited system configuration abilities.

**Permissions:**
- client.read: View client information
- aircraft.write: Manage aircraft
- employee.write: Manage employees
- turno.write: Manage shifts
- report.write: Full report access
- schedule.write: Manage schedules
- analytics.read: View analytics
- export.write: Generate exports
- audit.read: View audit logs

### 3. Supervisor (supervisor)
Shift supervisor with team management capabilities.

**Permissions:**
- aircraft.read: View aircraft
- employee.read: View employees
- turno.write: Manage own shifts
- report.write: Create/edit reports
- schedule.read: View schedules
- analytics.basic: Basic analytics
- export.basic: Basic exports

### 4. Técnico (tecnico)
Technical staff performing aircraft services.

**Permissions:**
- aircraft.read: View aircraft
- turno.read: View shifts
- report.basic: Basic report creation
- schedule.read: View schedules

### 5. Auxiliar (auxiliar)
Support staff with minimal system access.

**Permissions:**
- aircraft.read: View aircraft
- turno.read: View shifts
- report.basic: Basic report access

### 6. Cliente (cliente)
Airline client with access to own data only.

**Permissions:**
- aircraft.read.own: View own aircraft
- report.read.own: View own reports
- analytics.basic.own: View own analytics
- export.basic.own: Export own reports

## Permission Domains

### User Management (user.*)
- user.create: Create new users
- user.read: View user details
- user.update: Modify user details
- user.delete: Remove users
- user.assign_role: Assign roles to users

### Client Management (client.*)
- client.create: Create new clients
- client.read: View client details
- client.update: Modify client details
- client.delete: Remove clients
- client.config: Manage client configuration

### Aircraft Management (aircraft.*)
- aircraft.create: Add new aircraft
- aircraft.read: View aircraft details
- aircraft.update: Modify aircraft details
- aircraft.delete: Remove aircraft
- aircraft.status: Change aircraft status

### Employee Management (employee.*)
- employee.create: Add new employees
- employee.read: View employee details
- employee.update: Modify employee details
- employee.delete: Remove employees
- employee.assign: Assign to shifts/teams

### Shift Management (turno.*)
- turno.create: Create new shifts
- turno.read: View shift details
- turno.update: Modify shifts
- turno.delete: Remove shifts
- turno.assign: Assign employees to shifts

### Report Management (report.*)
- report.create: Create new reports
- report.read: View reports
- report.update: Modify reports
- report.delete: Remove reports
- report.export: Export reports
- report.config: Manage report templates

### Schedule Management (schedule.*)
- schedule.create: Create schedules
- schedule.read: View schedules
- schedule.update: Modify schedules
- schedule.delete: Remove schedules

### Analytics Access (analytics.*)
- analytics.full: Complete analytics access
- analytics.basic: Basic KPI view
- analytics.export: Export analytics data

### Export Capabilities (export.*)
- export.pdf: Generate PDF exports
- export.excel: Generate Excel exports
- export.bulk: Bulk export capabilities

### Audit Management (audit.*)
- audit.read: View audit logs
- audit.export: Export audit data
- audit.config: Configure audit settings

### System Configuration (system.*)
- system.settings: Manage system settings
- system.maintenance: System maintenance tasks
- system.backup: Manage backups
- system.restore: Restore from backups

### Role Management (role.*)
- role.create: Create new roles
- role.read: View roles
- role.update: Modify roles
- role.delete: Remove roles

### Permission Management (permissions.*)
- permissions.assign: Assign permissions
- permissions.revoke: Revoke permissions
- permissions.audit: Audit permissions

## Implementation Details

### RLS Policies
All permissions are implemented through Postgres Row Level Security (RLS) policies. See `erd.md` for specific policy implementations.

### Function-Based Checks
Two main functions control access:
1. `has_role(user_id UUID, role user_role)`: Check specific role
2. `is_admin_or_manager(user_id UUID)`: Check admin/manager status

### Audit Trail
All permission-related actions are logged:
- Role assignments
- Permission changes
- Access attempts
- Export operations

### Client Isolation
Multi-tenant security through:
- Client-specific RLS policies
- Role-client associations
- Resource ownership checks