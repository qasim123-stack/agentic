-- ─── Staff ───────────────────────────────────────────────────────────────────
create table if not exists staff (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text not null,
  training     text not null,  -- 'Current' | 'Overdue Xd'
  access       text not null,  -- 'Active' | 'Terminated'
  risk         text not null,  -- 'green' | 'amber' | 'red'
  last_access  text not null,
  created_at   timestamptz default now()
);

-- ─── Systems ─────────────────────────────────────────────────────────────────
create table if not exists systems (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         text not null,
  mfa          boolean not null default false,
  encrypted    boolean not null default false,
  baa          boolean not null default false,
  last_audit   text not null,
  risk         text not null,
  issue        text,
  created_at   timestamptz default now()
);

-- ─── Vendors ─────────────────────────────────────────────────────────────────
create table if not exists vendors (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  type              text not null,
  baa_expiry        date not null,
  breach_clause     boolean not null default false,
  subcontractors    boolean not null default false,
  risk              text not null,
  exposure          text not null,
  created_at        timestamptz default now()
);

-- ─── Incidents ───────────────────────────────────────────────────────────────
create table if not exists incidents (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  type       text not null,
  description text not null,
  status     text not null,
  severity   text not null,
  created_at timestamptz default now()
);

-- ─── Gap analyses (saved results from Documents page) ────────────────────────
create table if not exists gap_analyses (
  id             uuid primary key default gen_random_uuid(),
  filename       text not null default 'Untitled',
  overall_score  int not null,
  summary        text not null,
  gaps           jsonb not null default '[]',
  created_at     timestamptz default now()
);
