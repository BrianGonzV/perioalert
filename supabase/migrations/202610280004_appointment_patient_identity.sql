-- Minimal identity details collected when a signed-in patient requests an appointment.
alter table public.profiles
  add column if not exists age smallint,
  add column if not exists dni text;

alter table public.profiles
  drop constraint if exists profiles_age_range_check,
  add constraint profiles_age_range_check
    check (age is null or age between 0 and 120),
  drop constraint if exists profiles_dni_format_check,
  add constraint profiles_dni_format_check
    check (dni is null or dni ~ '^[0-9]{8}$');

comment on column public.profiles.age is 'Age last provided by the patient for appointment intake.';
comment on column public.profiles.dni is 'Optional eight-digit Peruvian DNI provided for patient identification.';

grant update (age, dni) on public.profiles to authenticated;

alter table public.appointment_requests
  drop constraint if exists appointment_requests_privacy_notice_version_check,
  add constraint appointment_requests_privacy_notice_version_check
    check (privacy_notice_version in ('v1', 'v2', 'v3'));

alter table public.appointment_requests
  drop constraint if exists appointment_requests_sensitive_notice_check,
  add constraint appointment_requests_sensitive_notice_check
    check (
      (sensitive_data_consent_at is null and sensitive_data_notice_version is null)
      or (sensitive_data_consent_at is not null and sensitive_data_notice_version in ('v2', 'v3'))
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
  and privacy_notice_version = 'v3'
  and sensitive_data_consent_at is not null
  and sensitive_data_notice_version = 'v3'
);
