-- Adds bookable half-hour slots to the simulated Trujillo clinic.
-- Existing requests keep a NULL time so their historical data remains intact.
alter table public.appointment_requests
  add column if not exists requested_time time;

alter table public.appointment_requests
  drop constraint if exists appointment_requests_clinic_slot_check;

alter table public.appointment_requests
  add constraint appointment_requests_clinic_slot_check
  check (
    requested_time is null
    or (
      (
        extract(isodow from requested_date) between 1 and 5
        and requested_time in (
          time '09:00', time '09:30', time '10:00', time '10:30',
          time '11:00', time '11:30', time '12:00', time '12:30',
          time '15:00', time '15:30', time '16:00', time '16:30',
          time '17:00', time '17:30'
        )
      )
      or (
        extract(isodow from requested_date) = 6
        and requested_time in (
          time '09:00', time '09:30', time '10:00', time '10:30',
          time '11:00', time '11:30', time '12:00', time '12:30'
        )
      )
    )
  );

create unique index if not exists appointment_requests_active_slot_idx
  on public.appointment_requests(requested_date, requested_time)
  where requested_time is not null and status <> 'cancelled';

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
  and privacy_notice_version = 'v1'
);

revoke insert (patient_id, requested_date, preferred_period, reason_code, consent_accepted_at, privacy_notice_version)
  on public.appointment_requests from authenticated;
grant insert (patient_id, requested_date, requested_time, preferred_period, reason_code, consent_accepted_at, privacy_notice_version)
  on public.appointment_requests to authenticated;

-- Exposes only occupied clock times for one day, without patient information.
create or replace function public.get_booked_appointment_times(p_requested_date date)
returns table(requested_time time)
language sql
stable
security definer
set search_path = ''
as $$
  select request.requested_time
  from public.appointment_requests as request
  where request.requested_date = p_requested_date
    and request.status <> 'cancelled'
    and request.requested_time is not null;
$$;

revoke all on function public.get_booked_appointment_times(date) from public, anon, authenticated;
grant execute on function public.get_booked_appointment_times(date) to authenticated;
