-- Add enum types
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE service_type AS ENUM ('cleaning', 'boarding', 'maintenance');

-- Create service_types table
CREATE TABLE service_types (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    checklist jsonb DEFAULT '[]'::jsonb,
    active boolean DEFAULT true,
    required_photos integer DEFAULT 0,
    required_signatures integer DEFAULT 0,
    version integer DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);

-- Create service_reports table
CREATE TABLE service_reports (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id uuid REFERENCES clients(id),
    shift_id uuid REFERENCES shifts(id),
    service_type service_type NOT NULL,
    aircraft_id uuid REFERENCES aircraft(id),
    service_date timestamptz NOT NULL,
    notes text,
    status report_status DEFAULT 'draft',
    checklist jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);

-- Create report_photos table
CREATE TABLE report_photos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id uuid REFERENCES service_reports(id) ON DELETE CASCADE,
    url text NOT NULL,
    type text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Create report_signatures table
CREATE TABLE report_signatures (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id uuid REFERENCES service_reports(id) ON DELETE CASCADE, 
    signature_url text NOT NULL,
    signer_name text NOT NULL,
    signer_role text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Create config tables
CREATE TABLE client_configs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id uuid REFERENCES clients(id),
    config_key text NOT NULL,
    config_value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    UNIQUE(client_id, config_key)
);

CREATE TABLE system_configs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key text NOT NULL UNIQUE,
    config_value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE report_configs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key text NOT NULL UNIQUE,
    config_value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);

-- Create RBAC tables
CREATE TABLE roles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE permissions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    resource text NOT NULL,
    action text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE(role_id, permission_id)
);

-- Add RLS policies
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Service Types policies
CREATE POLICY "Everyone can read active service types" ON service_types
    FOR SELECT USING (active = true);

CREATE POLICY "Only admins can create/update/delete service types" ON service_types
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
    ));

-- Reports policies
CREATE POLICY "View own reports" ON service_reports
    FOR SELECT USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT user_id FROM user_roles ur 
            WHERE ur.role IN ('super_admin'::user_role, 'gestor'::user_role)
        )
    );

CREATE POLICY "Create own reports" ON service_reports
    FOR INSERT WITH CHECK (auth.uid() = auth.uid());

CREATE POLICY "Update own reports" ON service_reports
    FOR UPDATE USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT user_id FROM user_roles ur 
            WHERE ur.role IN ('super_admin'::user_role, 'gestor'::user_role)
        )
    );

-- Report photos/signatures policies 
CREATE POLICY "View report attachments" ON report_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_reports sr
            WHERE sr.id = report_id AND (
                auth.uid() = sr.created_by OR
                auth.uid() IN (
                    SELECT user_id FROM user_roles ur 
                    WHERE ur.role IN ('super_admin'::user_role, 'gestor'::user_role)
                )
            )
        )
    );

CREATE POLICY "View report signatures" ON report_signatures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_reports sr
            WHERE sr.id = report_id AND (
                auth.uid() = sr.created_by OR
                auth.uid() IN (
                    SELECT user_id FROM user_roles ur 
                    WHERE ur.role IN ('super_admin'::user_role, 'gestor'::user_role)
                )
            )
        )
    );

-- Config policies
CREATE POLICY "Only admins manage system configs" ON system_configs
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
    ));

CREATE POLICY "Only admins manage report configs" ON report_configs
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
    ));

CREATE POLICY "View client configs" ON client_configs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles ur
            WHERE ur.client_id = client_configs.client_id
        ) OR
        auth.uid() IN (
            SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
        )
    );

CREATE POLICY "Only admins manage client configs" ON client_configs
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
    ));

-- RBAC policies
CREATE POLICY "Everyone can read roles" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Only admins manage roles" ON roles
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
    ));

CREATE POLICY "Everyone can read permissions" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "Only admins manage permissions" ON permissions
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
    ));

CREATE POLICY "Everyone can read role permissions" ON role_permissions
    FOR SELECT USING (true);

CREATE POLICY "Only admins manage role permissions" ON role_permissions
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'super_admin'::user_role
    ));

-- Add indexes
CREATE INDEX idx_service_reports_client ON service_reports(client_id);
CREATE INDEX idx_service_reports_aircraft ON service_reports(aircraft_id);
CREATE INDEX idx_service_reports_shift ON service_reports(shift_id);
CREATE INDEX idx_service_reports_status ON service_reports(status);
CREATE INDEX idx_service_reports_type ON service_reports(service_type);

CREATE INDEX idx_report_photos_report ON report_photos(report_id);
CREATE INDEX idx_report_signatures_report ON report_signatures(report_id);

CREATE INDEX idx_client_configs_client ON client_configs(client_id);
CREATE INDEX idx_client_configs_key ON client_configs(config_key);
CREATE INDEX idx_system_configs_key ON system_configs(config_key);
CREATE INDEX idx_report_configs_key ON report_configs(config_key);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);