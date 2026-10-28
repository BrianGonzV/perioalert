-- Run only after the clinic administrator has created and confirmed their account.
-- Replace the email below with that exact account email, then run once in SQL Editor.
insert into public.user_roles (user_id, role)
select id, 'clinic_admin'
from auth.users
where lower(email) = lower('REPLACE-WITH-CLINIC-ADMIN-EMAIL')
on conflict (user_id) do update set role = excluded.role;
