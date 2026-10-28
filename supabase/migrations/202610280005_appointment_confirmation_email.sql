-- Store the address the patient wants to receive the appointment receipt at.
alter table public.appointment_requests
  add column if not exists confirmation_email text;

alter table public.appointment_requests
  drop constraint if exists appointment_requests_confirmation_email_length_check,
  add constraint appointment_requests_confirmation_email_length_check
    check (confirmation_email is null or char_length(confirmation_email) between 3 and 254),
  drop constraint if exists appointment_requests_confirmation_email_format_check,
  add constraint appointment_requests_confirmation_email_format_check
    check (confirmation_email is null or confirmation_email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$');

comment on column public.appointment_requests.confirmation_email is
  'Patient-selected destination for the one-time appointment request receipt.';

grant insert (confirmation_email) on public.appointment_requests to authenticated;

alter table public.appointment_requests
  drop constraint if exists appointment_requests_privacy_notice_version_check,
  add constraint appointment_requests_privacy_notice_version_check
    check (privacy_notice_version in ('v1', 'v2', 'v3', 'v4'));

alter table public.appointment_requests
  drop constraint if exists appointment_requests_sensitive_notice_check,
  add constraint appointment_requests_sensitive_notice_check
    check (
      (sensitive_data_consent_at is null and sensitive_data_notice_version is null)
      or (sensitive_data_consent_at is not null and sensitive_data_notice_version in ('v2', 'v3', 'v4'))
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
  and status = 'requested'
  and consent_accepted_at is not null
  and privacy_notice_version = 'v4'
  and sensitive_data_consent_at is not null
  and sensitive_data_notice_version = 'v4'
  and confirmation_email is not null
);

-- Add the stored destination to the atomic one-time email claim.
drop function if exists public.claim_appointment_confirmation_email(uuid, uuid);

create function public.claim_appointment_confirmation_email(
  p_request_id uuid,
  p_patient_id uuid
)
returns table(requested_date date, requested_time time, confirmation_email text)
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
  returning request.requested_date, request.requested_time, request.confirmation_email;
$$;

revoke all on function public.claim_appointment_confirmation_email(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_appointment_confirmation_email(uuid, uuid) to service_role;
