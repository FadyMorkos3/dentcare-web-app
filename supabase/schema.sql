-- DentCare database schema for Supabase (PostgreSQL)
-- Run this in the Supabase SQL editor or via `supabase db push`.

create table if not exists public.admin_users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null,
  access text not null,
  status text not null check (status in ('Active', 'Disabled')),
  secure_sign_in boolean not null default true,
  last_active text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id text primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null,
  target text not null,
  detail text
);

create table if not exists public.patients (
  id text primary key,
  slug text not null unique,
  name text not null,
  full_name text not null,
  initials text,
  dob text,
  age integer,
  gender text,
  clinician text,
  last_visit text,
  next_appointment text,
  status text not null default 'Active',
  address text,
  email text,
  phone text,
  nhs_number text,
  registered_on text,
  registered_by text,
  allergies jsonb not null default '[]'::jsonb,
  populated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.admin_users enable row level security;
alter table public.audit_events enable row level security;
alter table public.patients enable row level security;

-- Allow authenticated users to read; admins write. Adjust to your auth model.
create policy "Authenticated read admin_users"
  on public.admin_users for select
  to authenticated
  using (true);

create policy "Authenticated write admin_users"
  on public.admin_users for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated read audit_events"
  on public.audit_events for select
  to authenticated
  using (true);

create policy "Authenticated insert audit_events"
  on public.audit_events for insert
  to authenticated
  with check (true);

create policy "Authenticated read patients"
  on public.patients for select
  to authenticated
  using (true);

create policy "Authenticated write patients"
  on public.patients for all
  to authenticated
  using (true)
  with check (true);

create table if not exists public.dental_charts (
  patient_slug text primary key references public.patients (slug) on delete cascade,
  chart_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dental_charts enable row level security;

create policy "Authenticated read dental_charts"
  on public.dental_charts for select
  to authenticated
  using (true);

create policy "Authenticated write dental_charts"
  on public.dental_charts for all
  to authenticated
  using (true)
  with check (true);

create table if not exists public.clinical_notes (
  id text primary key,
  patient_slug text not null references public.patients (slug) on delete cascade,
  date text not null,
  clinician text not null,
  title text not null,
  tag text,
  tone text,
  findings text not null,
  plan text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id text primary key,
  patient_name text not null,
  clinician text not null,
  date text not null,
  time text not null,
  reason text,
  status text not null default 'Scheduled',
  created_at timestamptz not null default now()
);

alter table public.clinical_notes enable row level security;
alter table public.appointments enable row level security;

create policy "Authenticated read clinical_notes"
  on public.clinical_notes for select to authenticated using (true);
create policy "Authenticated write clinical_notes"
  on public.clinical_notes for all to authenticated using (true) with check (true);

create policy "Authenticated read appointments"
  on public.appointments for select to authenticated using (true);
create policy "Authenticated write appointments"
  on public.appointments for all to authenticated using (true) with check (true);

create table if not exists public.prescriptions (
  id text primary key,
  patient_name text not null,
  medication text not null,
  dosage text not null,
  frequency text,
  duration text,
  notes text,
  clinician text,
  date text,
  created_at timestamptz not null default now()
);

alter table public.prescriptions enable row level security;

create policy "Authenticated read prescriptions"
  on public.prescriptions for select to authenticated using (true);
create policy "Authenticated write prescriptions"
  on public.prescriptions for all to authenticated using (true) with check (true);

create table if not exists public.treatment_plans (
  id text primary key,
  patient_slug text not null references public.patients (slug) on delete cascade,
  title text not null,
  total numeric,
  status text not null default 'Draft',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id text primary key,
  patient_slug text not null references public.patients (slug) on delete cascade,
  amount numeric not null,
  status text not null default 'Unpaid',
  reference text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.treatment_plans enable row level security;
alter table public.invoices enable row level security;

create policy "Authenticated read treatment_plans"
  on public.treatment_plans for select to authenticated using (true);
create policy "Authenticated write treatment_plans"
  on public.treatment_plans for all to authenticated using (true) with check (true);

create policy "Authenticated read invoices"
  on public.invoices for select to authenticated using (true);
create policy "Authenticated write invoices"
  on public.invoices for all to authenticated using (true) with check (true);

-- Helpful updated_at trigger:

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger admin_users_touch_updated_at
  before update on public.admin_users
  for each row execute function public.touch_updated_at();

create trigger patients_touch_updated_at
  before update on public.patients
  for each row execute function public.touch_updated_at();