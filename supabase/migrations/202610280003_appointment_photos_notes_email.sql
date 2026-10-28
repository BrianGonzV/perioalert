-- Private, patient-owned intake photos and notes for appointment requests.
alter table public.appointment_requests
  add column if not exists patient_note text,
  add column if not exists sensitive_data_consent_at timestamptz,
  add column if not exists sensitive_data_notice_version text,
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists confirmation_email_claimed_at timestamptz;

alter table public.appointment_requests
  drop constraint if exists appointment_requests_patient_note_length_check,
  add constraint appointment_requests_patient_note_length_check
    check (patient_note is null or char_length(patient_note) <= 1500);

alter table public.appointment_requests
  drop constraint if exists appointment_requests_privacy_notice_version_check,
  add constraint appointment_requests_privacy_notice_version_check
    check (privacy_notice_version in ('v1', 'v2'));

alter table public.appointment_requests
  drop constraint if exists appointment_requests_sensitive_notice_check,
  add constraint appointment_requests_sensitive_notice_check
    check (
      (sensitive_data_consent_at is null and sensitive_data_notice_version is null)
      or (sensitive_data_consent_at is not null and sensitive_data_notice_version = 'v2')
    );

create table if not exists public.appointment_attachments (
  id uuid primary key default gen_random_uuid(),
  appointment_request_id uuid not null references public.appointment_requests(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  file_size_bytes integer not null check (file_size_bytes between 1 and 5242880),
  created_at timestamptz not null default now()
);

create index if not exists appointment_attachments_request_idx
  on public.appointment_attachments(appointment_request_id);

alter table public.appointment_attachments enable row level security;
revoke all on public.appointment_attachments from anon, authenticated;
grant select, insert, delete on public.appointment_attachments to authenticated;

create policy "Patients and clinic admins read appointment attachments"
on public.appointment_attachments for select to authenticated
using (owner_id = (select auth.uid()) or (select private.is_clinic_admin()));

create policy "Patients attach images to their own pending request"
on public.appointment_attachments for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.appointment_requests as request
    where request.id = appointment_request_id
      and request.patient_id = (select auth.uid())
      and request.status = 'requested'
  )
);

create policy "Patients remove their own attachment records"
on public.appointment_attachments for delete to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Patients create appointment requests for themselves"
  on public.appointment_requests;

create policy "Patients create appointment requests for themselves"
on public.appointment_requests for insert to authenticated
with check (
  patient_id = (select auth.uid())
  and requested_date >= (now() at time zone 'America/Lima')::date
  and requested_time is not null
  and ((requested_date + requested_time) at time zone 'America/Lima') >= now() + interval '60 minutes'
  and status = 'requested'
  and consent_accepted_at is not null
  and privacy_notice_version = 'v2'
  and sensitive_data_consent_at is not null
  and sensitive_data_notice_version = 'v2'
);

create policy "Patients remove their own unconfirmed appointment requests"
on public.appointment_requests for delete to authenticated
using (patient_id = (select auth.uid()) and status = 'requested');

grant delete on public.appointment_requests to authenticated;
revoke insert (patient_id, requested_date, requested_time, preferred_period, reason_code, consent_accepted_at, privacy_notice_version)
  on public.appointment_requests from authenticated;
grant insert (id, patient_id, requested_date, requested_time, preferred_period, reason_code, patient_note, consent_accepted_at, privacy_notice_version, sensitive_data_consent_at, sensitive_data_notice_version)
  on public.appointment_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'appointment-photos',
  'appointment-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Patients upload images for their own pending appointment"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'appointment-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.appointment_requests as request
    where request.id::text = (storage.foldername(name))[2]
      and request.patient_id = (select auth.uid())
      and request.status = 'requested'
  )
);

create policy "Patients and clinic admins read appointment photos"
on storage.objects for select to authenticated
using (
  bucket_id = 'appointment-photos'
  and exists (
    select 1
    from public.appointment_attachments as attachment
    where attachment.storage_path = name
      and (
        attachment.owner_id = (select auth.uid())
        or (select private.is_clinic_admin())
      )
  )
);

create policy "Patients remove their own appointment photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'appointment-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Atomically claim the one-time confirmation email for an authenticated request.
create or replace function public.claim_appointment_confirmation_email(
  p_request_id uuid,
  p_patient_id uuid
)
returns table(requested_date date, requested_time time)
language sql
security definer
set search_path = ''
as $$
  update public.appointment_requests as request
  set confirmation_email_claimed_at = now()
  where request.id = p_request_id
    and request.patient_id = p_patient_id
    and request.status = 'requested'
    and request.confirmation_email_sent_at is null
    and (
      request.confirmation_email_claimed_at is null
      or request.confirmation_email_claimed_at < now() - interval '10 minutes'
    )
  returning request.requested_date, request.requested_time;
$$;

revoke all on function public.claim_appointment_confirmation_email(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_appointment_confirmation_email(uuid, uuid) to service_role;
