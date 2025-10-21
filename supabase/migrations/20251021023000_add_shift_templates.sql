create table "public"."shift_templates" (
  "id" uuid not null default gen_random_uuid(),
  "nome" text not null,
  "descricao" text,
  "horario_inicio" time not null,
  "horario_fim" time not null,
  "created_at" timestamp with time zone not null default now(),
  "created_by" uuid not null references auth.users(id),
  "updated_at" timestamp with time zone not null default now(),
  "updated_by" uuid references auth.users(id),
  "deleted_at" timestamp with time zone,
  "deleted_by" uuid references auth.users(id),
  constraint "shift_templates_pkey" primary key ("id")
);

create table "public"."shift_template_employees" (
  "id" uuid not null default gen_random_uuid(),
  "template_id" uuid not null references shift_templates(id),
  "employee_id" uuid not null references employees(id),
  "created_at" timestamp with time zone not null default now(),
  "created_by" uuid not null references auth.users(id),
  "updated_at" timestamp with time zone not null default now(),
  "updated_by" uuid references auth.users(id),
  "deleted_at" timestamp with time zone,
  "deleted_by" uuid references auth.users(id),
  constraint "shift_template_employees_pkey" primary key ("id")
);

-- RLS Policies
alter table "public"."shift_templates" enable row level security;
alter table "public"."shift_template_employees" enable row level security;

-- Templates can be read by any authenticated user within the same organization
create policy "Users can view shift templates"
  on "public"."shift_templates"
  for select using (
    auth.role() in ('authenticated')
  );

-- Templates can only be created/updated/deleted by admins and supervisors
create policy "Only admins and supervisors can manage shift templates"
  on "public"."shift_templates"
  for all using (
    auth.role() in ('super_admin', 'admin', 'supervisor')
  );

-- Template employees can be viewed by authenticated users
create policy "Users can view template employees"
  on "public"."shift_template_employees"
  for select using (
    auth.role() in ('authenticated')
  );

-- Template employees can be managed by admins and supervisors
create policy "Only admins and supervisors can manage template employees"
  on "public"."shift_template_employees"
  for all using (
    auth.role() in ('super_admin', 'admin', 'supervisor')
  );