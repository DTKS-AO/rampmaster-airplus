-- Enable RLS
alter table public.aircraft enable row level security;
alter table public.employees enable row level security;
alter table public.shifts enable row level security;
alter table public.teams enable row level security;

-- Aircraft RLS Policies
create policy "Aircraft visible to owner client"
  on public.aircraft
  for select
  using (
    auth.uid() in (
      select p.id from profiles p
      where p.client_id = aircraft.client_id
    )
  );

create policy "Aircraft manageable by AirPlus staff"
  on public.aircraft
  for all
  using (
    has_role('super_admin', auth.uid()) or
    has_role('gestor', auth.uid()) or
    has_role('supervisor', auth.uid())
  );

-- Employee RLS Policies
create policy "Employees viewable by all authenticated users"
  on public.employees
  for select
  using (auth.role() = 'authenticated');

create policy "Employees manageable by admins and managers"
  on public.employees
  for all
  using (
    has_role('super_admin', auth.uid()) or
    has_role('gestor', auth.uid())
  );

-- Shift RLS Policies
create policy "Shifts viewable by all authenticated users"
  on public.shifts
  for select
  using (auth.role() = 'authenticated');

create policy "Shifts manageable by admins and managers"
  on public.shifts
  for insert update delete
  using (
    has_role('super_admin', auth.uid()) or
    has_role('gestor', auth.uid())
  );

-- Team RLS Policies
create policy "Teams viewable by all authenticated users"
  on public.teams
  for select
  using (auth.role() = 'authenticated');

create policy "Teams manageable by admins and managers"
  on public.teams
  for insert update delete
  using (
    has_role('super_admin', auth.uid()) or
    has_role('gestor', auth.uid())
  );

-- Add missing audit fields and constraints
alter table public.aircraft
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add constraint unique_matricula unique (matricula);

alter table public.employees
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add constraint unique_email unique (email),
  add constraint unique_numero_mecanografico unique (numero_mecanografico);

-- Create function to update ultima_limpeza on aircraft
create or replace function update_aircraft_ultima_limpeza()
returns trigger as $$
begin
  update aircraft
  set ultima_limpeza = new.created_at
  where id = new.aircraft_id;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updating ultima_limpeza when report is created
create trigger update_aircraft_ultima_limpeza_trigger
  after insert on reports
  for each row
  execute function update_aircraft_ultima_limpeza();

-- Create audit_logs table if not exists
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on audit_logs
alter table public.audit_logs enable row level security;

-- Only admins and managers can view audit logs
create policy "Audit logs viewable by admins and managers"
  on public.audit_logs
  for select
  using (
    has_role('super_admin', auth.uid()) or
    has_role('gestor', auth.uid())
  );

-- Create audit trigger function
create or replace function audit_trigger_function()
returns trigger as $$
declare
  old_row jsonb := null;
  new_row jsonb := null;
begin
  if (tg_op = 'DELETE') then
    old_row := row_to_json(old)::jsonb;
  elsif (tg_op = 'UPDATE') then
    old_row := row_to_json(old)::jsonb;
    new_row := row_to_json(new)::jsonb;
  elsif (tg_op = 'INSERT') then
    new_row := row_to_json(new)::jsonb;
  end if;

  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) values (
    auth.uid(),
    tg_op,
    tg_table_name,
    case
      when tg_op = 'DELETE' then (old_row->>'id')::uuid
      else (new_row->>'id')::uuid
    end,
    old_row,
    new_row
  );

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Add audit triggers to core tables
create trigger audit_aircraft_changes
  after insert or update or delete on public.aircraft
  for each row execute function audit_trigger_function();

create trigger audit_employees_changes
  after insert or update or delete on public.employees
  for each row execute function audit_trigger_function();

create trigger audit_shifts_changes
  after insert or update or delete on public.shifts
  for each row execute function audit_trigger_function();

create trigger audit_teams_changes
  after insert or update or delete on public.teams
  for each row execute function audit_trigger_function();