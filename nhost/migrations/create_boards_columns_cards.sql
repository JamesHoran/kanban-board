-- boards
create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null, -- x-hasura-user-id
  created_at timestamptz default now()
);

-- columns
create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  name text not null,
  position double precision not null default 1000.0,
  created_at timestamptz default now()
);

-- cards
create table cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid references columns(id) on delete cascade,
  title text not null,
  description text,
  position double precision not null default 1000.0,
  created_at timestamptz default now()
);