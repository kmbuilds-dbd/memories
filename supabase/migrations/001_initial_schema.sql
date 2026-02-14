-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- memories table
create table memories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector generated always as (to_tsvector('english', content)) stored
);

-- media table
create table media (
  id uuid primary key default uuid_generate_v4(),
  memory_id uuid references memories on delete cascade not null,
  user_id uuid references auth.users not null,
  type text check (type in ('photo', 'video')) not null,
  storage_path text not null,
  thumbnail_path text,
  display_order integer default 0,
  created_at timestamptz default now() not null
);

-- tags table
create table tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now() not null,
  unique (user_id, name)
);

-- memory_tags join table
create table memory_tags (
  memory_id uuid references memories on delete cascade,
  tag_id uuid references tags on delete cascade,
  created_at timestamptz default now() not null,
  primary key (memory_id, tag_id)
);

-- Indexes
create index memories_user_id_idx on memories(user_id);
create index memories_created_at_idx on memories(created_at desc);
create index memories_search_idx on memories using gin(search_vector);
create index media_memory_id_idx on media(memory_id);
create index tags_user_id_idx on tags(user_id);

-- Row Level Security
alter table memories enable row level security;
alter table media enable row level security;
alter table tags enable row level security;
alter table memory_tags enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can CRUD own memories" on memories
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own media" on media
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own tags" on tags
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own memory_tags" on memory_tags
  for all using (
    exists (select 1 from memories where id = memory_id and user_id = auth.uid())
  );

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger memories_updated_at
  before update on memories
  for each row execute function update_updated_at();
