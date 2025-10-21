# Security and Audit Documentation

## Overview

This document outlines the security measures and audit logging implementation for the AirPlus AAMS system. The system is designed with a security-first approach, implementing multiple layers of protection and comprehensive audit trails.

## Security Measures

### 1. Authentication
- Supabase Auth with JWT tokens
- Session management via localStorage
- Auto refresh tokens
- Secure password policies
- MFA support (when enabled)

### 2. Authorization
- Row Level Security (RLS) in PostgreSQL
- Role-based access control (RBAC)
- Client isolation (multi-tenant)
- Permission granularity
- Function-level security

### 3. Data Protection
- HTTPS/TLS for all communications
- Encrypted data at rest
- Secure file upload/download
- Input validation
- SQL injection prevention
- XSS protection

### 4. Frontend Security
- CSP headers
- CSRF protection
- Secure cookie handling
- Input sanitization
- File upload validation
- PDF generation security

## Audit Logging

### 1. Audit Table Structure
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tracked Operations
- Record creation
- Record updates
- Record deletion
- Authentication events
- Permission changes
- Export operations
- Critical data access

### 3. Audit Fields
All major tables include:
- created_at
- updated_at
- created_by
- updated_by

### 4. Logged Information
Each audit entry captures:
- Who: user_id
- What: action + changes
- When: timestamp
- Where: IP address
- Previous state: old_values
- New state: new_values

### 5. Critical Operations
The following operations require mandatory audit logging:

#### User Management
- User creation/deletion
- Role changes
- Permission updates
- Password resets

#### Client Data
- Client creation/updates
- Aircraft management
- Employee records
- Configuration changes

#### Operational Data
- Report creation/editing
- Export operations
- Schedule changes
- Team assignments

#### System Configuration
- Service type changes
- Template modifications
- System settings updates

## Security Implementation

### 1. Row Level Security (RLS)

#### Client Isolation
```sql
CREATE POLICY "Clients visible to owner and AirPlus" ON public.aircraft
  FOR SELECT TO authenticated 
  USING (
    public.is_admin_or_manager(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.client_id = aircraft.client_id
    )
  );
```

#### Role-Based Access
```sql
CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'super_admin'));
```

### 2. Audit Triggers

#### Update Tracking
```sql
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data = row_to_json(OLD)::JSONB;
    INSERT INTO public.audit_logs (
      user_id, action, table_name, record_id, old_values
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, old_data
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data = row_to_json(OLD)::JSONB;
    new_data = row_to_json(NEW)::JSONB;
    INSERT INTO public.audit_logs (
      user_id, action, table_name, record_id, old_values, new_values
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, old_data, new_data
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data = row_to_json(NEW)::JSONB;
    INSERT INTO public.audit_logs (
      user_id, action, table_name, record_id, new_values
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, new_data
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Security Best Practices

### 1. Password Requirements
- Minimum length: 12 characters
- Must include: uppercase, lowercase, numbers, special characters
- Password history: prevent reuse of last 5 passwords
- Maximum age: 90 days

### 2. Session Management
- Token expiration: 8 hours
- Refresh token rotation
- Concurrent session limits
- Secure session storage

### 3. File Upload Security
- File type validation
- Size limits
- Virus scanning
- Secure storage paths
- Access control

### 4. Export Security
- Rate limiting
- Watermarking
- Access logging
- Format validation

### 5. Error Handling
- Secure error messages
- Error logging
- Rate limiting
- Fail-safe defaults

## Monitoring and Alerts

### 1. Security Monitoring
- Failed login attempts
- Unusual access patterns
- Permission violations
- Export volume alerts

### 2. Audit Reports
- Daily activity summaries
- User access reports
- Change history
- Export logs

### 3. Compliance Checks
- Permission audit
- Password compliance
- Access review
- Security settings

## Recovery Procedures

### 1. Security Incidents
- Incident classification
- Response procedures
- Communication plan
- Recovery steps

### 2. Data Recovery
- Backup procedures
- Restore process
- Data validation
- Audit verification

## Regular Reviews

### 1. Security Reviews
- Quarterly access review
- Permission audit
- Security settings check
- Incident review

### 2. Audit Reviews
- Log analysis
- Pattern detection
- Compliance verification
- Process improvement