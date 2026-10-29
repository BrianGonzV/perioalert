-- New bookings reserve their slot as confirmed and receive a PDF receipt by email.
-- The appointment still uses the simulated clinic's schedule/location documented in the README.

alter table public.appointment_requests
  drop constraint if exists appointment_requests_privacy_notice_version_check,
  add constraint appointment_requests_privacy_notice_version_check
    check (privacy_notice_version in ('v1', 'v2', 'v3', 'v4', 'v5')),
  drop constraint if exists appointment_requests_sensitive_notice_check,
  add constraint appointment_requests_sensitive_notice_check
    check (
      (sensitive_data_consent_at is null and sensitive_data_notice_version is null)
      or (sensitive_data_consent_at is not null and sensitive_data_notice_version in ('v2', 'v3', 'v4', 'v5'))
    );

drop policy if exists "Patients create appointment requests for themselves"
  on public.appointment_requests;

create policy "Patients create appointment requests for themselves"
on public.appointment_requests for insert to authenticated
with check (
  patient_id = (select auth.uid())
  and requested_date >= (now() at time zone 'America/Lima')::date
  and requested_time is not null
  and ((requested_date + requested_time) at time zone 'America/Lima') >= now() + interval '60 minutes'
  and status = 'confirmed'
  and consent_accepted_at is not null
  and privacy_notice_version = 'v5'
  and sensitive_data_consent_at is not null
  and sensitive_data_notice_version = 'v5'
  and confirmation_email is not null
);

grant insert (status) on public.appointment_requests to authenticated;

drop policy if exists "Patients attach images to their own pending request"
  on public.appointment_attachments;

create policy "Patients attach images to their own appointment"
on public.appointment_attachments for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.appointment_requests as request
    where request.id = appointment_request_id
      and request.patient_id = (select auth.uid())
      and request.status in ('requested', 'confirmed')
  )
);

drop policy if exists "Patients upload images for their own pending appointment"
  on storage.objects;

create policy "Patients upload images for their own appointment"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'appointment-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.appointment_requests as request
    where request.id::text = (storage.foldername(name))[2]
      and request.patient_id = (select auth.uid())
      and request.status in ('requested', 'confirmed')
  )
);

drop policy if exists "Patients remove their own unconfirmed appointment requests"
  on public.appointment_requests;

create policy "Patients remove their own unconfirmed appointment requests"
on public.appointment_requests for delete to authenticated
using (
  patient_id = (select auth.uid())
  and status in ('requested', 'confirmed')
  and confirmation_email_sent_at is null
);

-- The Edge Function can only claim a receipt for a confirmed booking owned by its caller.
drop function if exists public.claim_appointment_confirmation_email(uuid, uuid);

create function public.claim_appointment_confirmation_email(
  p_request_id uuid,
  p_patient_id uuid
)
returns table(
  appointment_id uuid,
  requested_date date,
  requested_time time,
  confirmation_email text,
  full_name text,
  reason_code text
)
language sql
security definer
set search_path = ''
as $$
  with claimed as (
    update public.appointment_requests as request
    set confirmation_email_claimed_at = now()
    where request.id = p_request_id
      and request.patient_id = p_patient_id
      and request.status = 'confirmed'
      and request.requested_time is not null
      and request.confirmation_email is not null
      and request.confirmation_email_sent_at is null
      and (
        request.confirmation_email_claimed_at is null
        or request.confirmation_email_claimed_at < now() - interval '10 minutes'
      )
    returning request.id, request.patient_id, request.requested_date, request.requested_time,
      request.confirmation_email, request.reason_code
  )
  select claimed.id, claimed.requested_date, claimed.requested_time,
    claimed.confirmation_email, coalesce(profile.full_name, 'Paciente'), claimed.reason_code
  from claimed
  left join public.profiles as profile on profile.id = claimed.patient_id;
$$;

revoke all on function public.claim_appointment_confirmation_email(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_appointment_confirmation_email(uuid, uuid) to service_role;
