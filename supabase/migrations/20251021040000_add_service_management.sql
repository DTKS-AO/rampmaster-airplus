-- Service Types and Configuration Management

-- Service Types Table with Versioning
CREATE TABLE service_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    checklist jsonb, -- Lista de verificação padrão
    required_photos int DEFAULT 0,
    required_signatures int DEFAULT 0,
    version int NOT NULL DEFAULT 1,
    active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for service_types
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything" ON service_types
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'super_admin')
    WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Users can view active services" ON service_types
    FOR SELECT
    TO authenticated
    USING (active = true AND (valid_until IS NULL OR valid_until > now()));

-- Client Configuration Table
CREATE TABLE client_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id),
    config_key text NOT NULL,
    config_value jsonb NOT NULL,
    version int NOT NULL DEFAULT 1,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (client_id, config_key, version)
);

-- Add RLS policies for client_configs
ALTER TABLE client_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything" ON client_configs
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'super_admin')
    WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Users can view their client config" ON client_configs
    FOR SELECT
    TO authenticated
    USING (
        client_id = (auth.jwt()->'user_metadata'->>'client_id')::uuid
        AND (valid_until IS NULL OR valid_until > now())
    );

-- System Configuration Table
CREATE TABLE system_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key text NOT NULL,
    config_value jsonb NOT NULL,
    version int NOT NULL DEFAULT 1,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (config_key, version)
);

-- Add RLS policies for system_configs
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything" ON system_configs
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'super_admin')
    WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Users can view active system configs" ON system_configs
    FOR SELECT
    TO authenticated
    USING (valid_until IS NULL OR valid_until > now());

-- Report Configuration Table
CREATE TABLE report_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key text NOT NULL,
    config_value jsonb NOT NULL,
    service_type_id uuid REFERENCES service_types(id),
    version int NOT NULL DEFAULT 1,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (config_key, service_type_id, version)
);

-- Add RLS policies for report_configs
ALTER TABLE report_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything" ON report_configs
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'super_admin')
    WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Users can view active report configs" ON report_configs
    FOR SELECT
    TO authenticated
    USING (valid_until IS NULL OR valid_until > now());

-- Dynamic Roles and Permissions Tables
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    is_system boolean DEFAULT false,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    resource text NOT NULL,
    action text NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE role_permissions (
    role_id uuid REFERENCES roles(id),
    permission_id uuid REFERENCES permissions(id),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- Add RLS policies for roles and permissions
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything" ON roles
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'super_admin')
    WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Users can view roles" ON roles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can do everything" ON permissions
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'super_admin')
    WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Users can view permissions" ON permissions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can do everything" ON role_permissions
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'super_admin')
    WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Users can view role permissions" ON role_permissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Create functions for versioned updates
CREATE OR REPLACE FUNCTION create_service_type_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Set valid_until for the current version
    UPDATE service_types
    SET valid_until = now()
    WHERE id = NEW.id AND valid_until IS NULL;
    
    -- Insert new version
    NEW.version = COALESCE(
        (SELECT version + 1
         FROM service_types
         WHERE id = NEW.id
         ORDER BY version DESC
         LIMIT 1),
        1
    );
    NEW.valid_from = now();
    NEW.valid_until = NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_type_version_trigger
    BEFORE INSERT OR UPDATE ON service_types
    FOR EACH ROW
    WHEN (NEW.id IS NOT NULL)
    EXECUTE FUNCTION create_service_type_version();

-- Create views for active configurations
CREATE VIEW active_configs AS
SELECT
    COALESCE(cc.client_id, sc.id) as entity_id,
    COALESCE(cc.config_key, sc.config_key) as config_key,
    COALESCE(cc.config_value, sc.config_value) as config_value,
    COALESCE(cc.version, sc.version) as version,
    CASE
        WHEN cc.id IS NOT NULL THEN 'client'
        ELSE 'system'
    END as config_type
FROM client_configs cc
FULL OUTER JOIN system_configs sc
    ON cc.config_key = sc.config_key
WHERE (cc.valid_until IS NULL OR cc.valid_until > now())
    AND (sc.valid_until IS NULL OR sc.valid_until > now());

-- Create audit log function
CREATE OR REPLACE FUNCTION log_config_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_value,
        new_value
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        row_to_json(OLD),
        row_to_json(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers
CREATE TRIGGER service_types_audit
    AFTER INSERT OR UPDATE OR DELETE ON service_types
    FOR EACH ROW EXECUTE FUNCTION log_config_change();

CREATE TRIGGER client_configs_audit
    AFTER INSERT OR UPDATE OR DELETE ON client_configs
    FOR EACH ROW EXECUTE FUNCTION log_config_change();

CREATE TRIGGER system_configs_audit
    AFTER INSERT OR UPDATE OR DELETE ON system_configs
    FOR EACH ROW EXECUTE FUNCTION log_config_change();

CREATE TRIGGER report_configs_audit
    AFTER INSERT OR UPDATE OR DELETE ON report_configs
    FOR EACH ROW EXECUTE FUNCTION log_config_change();

-- Initial data for roles and permissions
INSERT INTO roles (name, description, is_system) VALUES
    ('super_admin', 'Super Administrator', true),
    ('gestor', 'Manager', true),
    ('supervisor', 'Supervisor', true),
    ('tecnico', 'Technician', true),
    ('auxiliar', 'Assistant', true),
    ('cliente', 'Client', true);

INSERT INTO permissions (name, description, resource, action) VALUES
    ('manage_services', 'Manage service types', 'service.*', 'write'),
    ('view_services', 'View service types', 'service.*', 'read'),
    ('manage_configs', 'Manage configurations', 'config.*', 'write'),
    ('view_configs', 'View configurations', 'config.*', 'read'),
    ('manage_roles', 'Manage roles and permissions', 'role.*', 'write'),
    ('view_roles', 'View roles and permissions', 'role.*', 'read'),
    ('manage_reports', 'Manage reports', 'report.*', 'write'),
    ('view_reports', 'View reports', 'report.*', 'read');