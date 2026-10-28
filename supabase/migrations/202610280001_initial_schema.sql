-- Perioalert: initial schema. Run in the Supabase SQL Editor before enabling live accounts.
-- Patient information is private by default. No demo/patient rows are inserted by this migration.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) between 1 and 120),
  phone text check (phone is null or char_length(phone) <= 32),
  age smallint constraint profiles_age_range_check check (age is null or age between 0 and 120),
  dni text constraint profiles_dni_format_check check (dni is null or dni ~ '^[0-9]{8}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'clinic_admin')),
  created_at timestamptz not null default now()
);

create table public.care_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  reminder_time time not null,
  repeat_days smallint[] not null default array[1,2,3,4,5,6,7]::smallint[],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint care_reminders_valid_days check (
    cardinality(repeat_days) between 1 and 7
    and repeat_days <@ array[1,2,3,4,5,6,7]::smallint[]
  )
);

create table public.care_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  brushed_morning boolean not null default false,
  brushed_evening boolean not null default false,
  cleaned_between_teeth boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, logged_on)
);

create table public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  requested_date date not null,
  preferred_period text not null check (preferred_period in ('morning', 'afternoon', 'any')),
  reason_code text not null check (reason_code in ('checkup', 'bleeding', 'sensitivity', 'other')),
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  consent_accepted_at timestamptz not null default now(),
  privacy_notice_version text not null default 'v1' check (privacy_notice_version = 'v1'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index care_reminders_user_id_idx on public.care_reminders(user_id);
create index care_logs_user_date_idx on public.care_logs(user_id, logged_on desc);
create index appointment_requests_patient_date_idx on public.appointment_requests(patient_id, requested_date desc);
create index appointment_requests_status_date_idx on public.appointment_requests(status, requested_date);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger care_logs_set_updated_at
before update on public.care_logs
for each row execute function private.set_updated_at();

create trigger appointment_requests_set_updated_at
before update on public.appointment_requests
for each row execute function private.set_updated_at();

create or replace function private.is_clinic_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'clinic_admin'
  );
$$;
revoke all on function private.is_clinic_admin() from public, anon;
grant execute on function private.is_clinic_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'patient')
  on conflict (user_id) do nothing;

  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.care_reminders enable row level security;
alter table public.care_logs enable row level security;
alter table public.appointment_requests enable row level security;

revoke all on public.profiles, public.user_roles, public.care_reminders, public.care_logs, public.appointment_requests from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, age, dni) on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, insert, update, delete on public.care_reminders to authenticated;
grant select, insert, update, delete on public.care_logs to authenticated;
grant select on public.appointment_requests to authenticated;
grant insert (patient_id, requested_date, preferred_period, reason_code, consent_accepted_at, privacy_notice_version) on public.appointment_requests to authenticated;
grant update (status) on public.appointment_requests to authenticated;

create policy "Patients and clinic admins read allowed profiles"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_clinic_admin()));

create policy "Patients update their own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Users can read their own role only"
on public.user_roles for select to authenticated
using (user_id = (select auth.uid()));

create policy "Patients manage their own reminders"
on public.care_reminders for select to authenticated
using (user_id = (select auth.uid()));
create policy "Patients create their own reminders"
on public.care_reminders for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "Patients update their own reminders"
on public.care_reminders for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Patients delete their own reminders"
on public.care_reminders for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Patients manage their own care logs"
on public.care_logs for select to authenticated
using (user_id = (select auth.uid()));
create policy "Patients create their own care logs"
on public.care_logs for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "Patients update their own care logs"
on public.care_logs for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Patients delete their own care logs"
on public.care_logs for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Patients read their own appointment requests"
on public.appointment_requests for select to authenticated
using (patient_id = (select auth.uid()) or (select private.is_clinic_admin()));
create policy "Patients create appointment requests for themselves"
on public.appointment_requests for insert to authenticated
with check (
  patient_id = (select auth.uid())
    and requested_date >= (now() at time zone 'America/Lima')::date
    and status = 'requested'
  and consent_accepted_at is not null
  and privacy_notice_version = 'v1'
);
create policy "Clinic admins update appointment status"
on public.appointment_requests for update to authenticated
using ((select private.is_clinic_admin()))
with check ((select private.is_clinic_admin()));

-- The clinic owner must replace the placeholder email with their own account after signing up.
-- Run manually in the SQL Editor; do not expose role writes to the browser client.
-- insert into public.user_roles (user_id, role)
-- select id, 'clinic_admin' from auth.users where email = 'CLINIC-OWNER-EMAIL';
-- on conflict (user_id) do update set role = excluded.role;
