create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_stage') then
    create type public.lead_stage as enum (
      'anonymous_visitor',
      'wishlist_only',
      'selection_started',
      'whatsapp_clicked',
      'whatsapp_confirmed',
      'qualified',
      'closed_won',
      'closed_lost'
    );
  end if;
end
$$;

create sequence if not exists public.mm_lead_ref_seq start 1;

create or replace function public.mm_next_lead_sequence()
returns bigint
language sql
security definer
as $$
  select nextval('public.mm_lead_ref_seq');
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  session_ref text not null unique,
  anonymous_id text not null,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  landing_page text not null,
  device_type text not null,
  browser text not null,
  country text,
  city text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  current_status public.lead_stage not null default 'anonymous_visitor',
  ip_address_hint text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_profiles (
  id uuid primary key default gen_random_uuid(),
  lead_ref text not null unique,
  session_id uuid not null references public.visitor_sessions(id) on delete cascade,
  anonymous_id text not null,
  whatsapp_click_count integer not null default 0,
  whatsapp_first_clicked_at timestamptz,
  whatsapp_last_clicked_at timestamptz,
  whatsapp_confirmed_at timestamptz,
  source_channel text not null default 'web',
  stage public.lead_stage not null default 'anonymous_visitor',
  notes_internal text,
  assigned_to_admin_user uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  name text not null,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.lead_profiles
  drop constraint if exists lead_profiles_assigned_to_admin_user_fkey;

alter table public.lead_profiles
  add constraint lead_profiles_assigned_to_admin_user_fkey
  foreign key (assigned_to_admin_user) references public.admin_users(id) on delete set null;

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.visitor_sessions(id) on delete cascade,
  product_id text not null,
  added_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique(session_id, product_id)
);

create table if not exists public.selections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.visitor_sessions(id) on delete cascade,
  product_id text not null,
  quantity integer not null default 1,
  added_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique(session_id, product_id)
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.visitor_sessions(id) on delete cascade,
  lead_id uuid references public.lead_profiles(id) on delete set null,
  event_name text not null,
  event_source text not null,
  product_id text,
  collection_slug text,
  metadata_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.lead_profiles(id) on delete cascade,
  old_stage public.lead_stage,
  new_stage public.lead_stage not null,
  changed_by_admin_user_id uuid references public.admin_users(id) on delete set null,
  reason text,
  changed_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.lead_profiles(id) on delete cascade,
  note text not null,
  created_by_admin_user_id uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.visitor_sessions(id) on delete set null,
  lead_id uuid references public.lead_profiles(id) on delete set null,
  name text not null,
  contact text not null,
  email text not null,
  location text not null,
  inquiry_note text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists visitor_sessions_anonymous_idx on public.visitor_sessions(anonymous_id);
create index if not exists visitor_sessions_last_seen_idx on public.visitor_sessions(last_seen_at desc);
create index if not exists lead_profiles_session_idx on public.lead_profiles(session_id);
create index if not exists lead_profiles_stage_idx on public.lead_profiles(stage);
create index if not exists wishlists_session_idx on public.wishlists(session_id);
create index if not exists selections_session_idx on public.selections(session_id);
create index if not exists lead_events_session_idx on public.lead_events(session_id);
create index if not exists lead_events_lead_idx on public.lead_events(lead_id);
create index if not exists lead_events_event_name_idx on public.lead_events(event_name);

drop trigger if exists visitor_sessions_touch_updated_at on public.visitor_sessions;
create trigger visitor_sessions_touch_updated_at
before update on public.visitor_sessions
for each row execute function public.touch_updated_at();

drop trigger if exists lead_profiles_touch_updated_at on public.lead_profiles;
create trigger lead_profiles_touch_updated_at
before update on public.lead_profiles
for each row execute function public.touch_updated_at();

drop trigger if exists selections_touch_updated_at on public.selections;
create trigger selections_touch_updated_at
before update on public.selections
for each row execute function public.touch_updated_at();

alter table public.visitor_sessions enable row level security;
alter table public.lead_profiles enable row level security;
alter table public.wishlists enable row level security;
alter table public.selections enable row level security;
alter table public.lead_events enable row level security;
alter table public.admin_users enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.lead_notes enable row level security;
alter table public.contact_inquiries enable row level security;

drop policy if exists "admin users can read own record" on public.admin_users;
create policy "admin users can read own record"
on public.admin_users
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "admin users can read sessions" on public.visitor_sessions;
create policy "admin users can read sessions"
on public.visitor_sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

drop policy if exists "admin users can read leads" on public.lead_profiles;
create policy "admin users can read leads"
on public.lead_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

drop policy if exists "admin users can read wishlists" on public.wishlists;
create policy "admin users can read wishlists"
on public.wishlists
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

drop policy if exists "admin users can read selections" on public.selections;
create policy "admin users can read selections"
on public.selections
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

drop policy if exists "admin users can read lead events" on public.lead_events;
create policy "admin users can read lead events"
on public.lead_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

drop policy if exists "admin users can read status history" on public.lead_status_history;
create policy "admin users can read status history"
on public.lead_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

drop policy if exists "admin users can read notes" on public.lead_notes;
create policy "admin users can read notes"
on public.lead_notes
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

drop policy if exists "admin users can read inquiries" on public.contact_inquiries;
create policy "admin users can read inquiries"
on public.contact_inquiries
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.auth_user_id = auth.uid()
  )
);

create or replace view public.admin_lead_overview as
select
  lp.id,
  lp.lead_ref,
  vs.session_ref,
  lp.stage,
  lp.whatsapp_click_count,
  lp.created_at,
  vs.last_seen_at,
  vs.utm_source,
  vs.utm_campaign,
  vs.country,
  au.name as assigned_to,
  coalesce(wl.count, 0) as wishlist_count,
  coalesce(sel.count, 0) as selection_count
from public.lead_profiles lp
join public.visitor_sessions vs on vs.id = lp.session_id
left join public.admin_users au on au.id = lp.assigned_to_admin_user
left join (
  select session_id, count(*) as count
  from public.wishlists
  group by session_id
) wl on wl.session_id = lp.session_id
left join (
  select session_id, count(*) as count
  from public.selections
  group by session_id
) sel on sel.session_id = lp.session_id;

create or replace view public.admin_dashboard_summary as
select
  (select count(*) from public.visitor_sessions) as total_sessions,
  (select count(*) from public.lead_profiles) as total_leads,
  (select count(*) from public.lead_profiles where stage = 'wishlist_only') as wishlist_only,
  (select count(*) from public.lead_profiles where stage = 'selection_started') as selection_started,
  (select count(*) from public.lead_profiles where stage = 'whatsapp_clicked') as whatsapp_clicked,
  (select count(*) from public.lead_profiles where stage = 'whatsapp_confirmed') as whatsapp_confirmed,
  (select count(*) from public.lead_profiles where stage = 'closed_won') as closed_won,
  (
    select count(*)
    from public.lead_profiles
    where updated_at < timezone('utc', now()) - interval '7 days'
      and stage not in ('closed_won', 'closed_lost')
  ) as stale_leads;
