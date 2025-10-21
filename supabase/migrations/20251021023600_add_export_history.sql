create type "public"."export_type" as enum ('pdf', 'csv');

create table "public"."shift_exports" (
  "id" uuid not null default gen_random_uuid(),
  "shift_id" uuid not null references shifts(id),
  "type" export_type not null,
  "file_name" text not null,
  "created_at" timestamp with time zone not null default now(),
  "created_by" uuid not null references auth.users(id),
  constraint "shift_exports_pkey" primary key ("id")
);

-- RLS Policies
alter table "public"."shift_exports" enable row level security;

-- Exports can be viewed by any authenticated user
create policy "Users can view shift exports"
  on "public"."shift_exports"
  for select using (
    auth.role() in ('authenticated')
  );

-- Exports can be created by any authenticated user
create policy "Users can create shift exports"
  on "public"."shift_exports"
  for insert with check (
    auth.role() in ('authenticated')
  );