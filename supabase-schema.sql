-- ============================================================
-- Franco Barber Studio — Schema database
-- Esegui questo file nel SQL Editor di Supabase
-- ============================================================

-- ============================================================
-- TABELLA: profiles
-- Estende auth.users con dati extra (nome, telefono)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  phone text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: crea profilo automaticamente alla registrazione
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABELLA: bookings (appuntamenti)
-- ============================================================
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  user_email text not null,
  client_name text not null,
  client_phone text not null,
  client_email text not null,
  service_id text not null,
  service_name text not null,
  price text not null,
  date text not null,
  date_iso timestamptz not null,
  time text not null,
  barber text not null,
  payment text not null,
  extras jsonb default '[]'::jsonb,
  status text default 'attiva',
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

drop policy if exists "Users can view own bookings" on public.bookings;
create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own bookings" on public.bookings;
create policy "Users can insert own bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own bookings" on public.bookings;
create policy "Users can update own bookings" on public.bookings
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own bookings" on public.bookings;
create policy "Users can delete own bookings" on public.bookings
  for delete using (auth.uid() = user_id);

create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_date_iso_idx on public.bookings(date_iso);

-- ============================================================
-- TABELLA: orders (ordini negozio)
-- ============================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  user_email text,
  reference text not null unique,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  status text default 'in attesa',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

-- Permette anche checkout da ospiti (non loggati)
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders" on public.orders
  for insert with check (true);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_reference_idx on public.orders(reference);

-- ============================================================
-- TABELLA: newsletter (iscrizioni email)
-- ============================================================
create table if not exists public.newsletter (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now()
);

alter table public.newsletter enable row level security;

-- Chiunque può iscriversi (anche ospiti non loggati)
drop policy if exists "Anyone can subscribe" on public.newsletter;
create policy "Anyone can subscribe" on public.newsletter
  for insert with check (true);

create index if not exists newsletter_email_idx on public.newsletter(email);
