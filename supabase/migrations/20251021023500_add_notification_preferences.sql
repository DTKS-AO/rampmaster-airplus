create table "public"."user_notification_preferences" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid not null references auth.users(id),
  "shift_status_changes" boolean not null default true,
  "shift_team_updates" boolean not null default true,
  "shift_reminders" boolean not null default true,
  "shift_reports" boolean not null default true,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  constraint "user_notification_preferences_pkey" primary key ("id"),
  constraint "user_notification_preferences_user_id_key" unique ("user_id")
);

-- RLS Policies
alter table "public"."user_notification_preferences" enable row level security;

-- Users can view and edit their own preferences
create policy "Users can view their own preferences"
  on "public"."user_notification_preferences"
  for select using (
    auth.uid() = user_id
  );

create policy "Users can update their own preferences"
  on "public"."user_notification_preferences"
  for update using (
    auth.uid() = user_id
  );

-- Trigger to automatically create preferences for new users
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_notification_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();