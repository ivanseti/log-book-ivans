-- Jalankan seluruh SQL ini di Supabase Dashboard > SQL Editor.
-- Setiap pengguna hanya dapat membaca/mengubah catatan miliknya sendiri.

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null check (char_length(title) between 1 and 180),
  category text not null check (char_length(category) between 1 and 80),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists activities_user_date_idx
  on public.activities (user_id, activity_date desc, start_time desc);

alter table public.activities enable row level security;

drop policy if exists "Users can view their own activities" on public.activities;
create policy "Users can view their own activities"
  on public.activities for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own activities" on public.activities;
create policy "Users can add their own activities"
  on public.activities for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own activities" on public.activities;
create policy "Users can update their own activities"
  on public.activities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own activities" on public.activities;
create policy "Users can delete their own activities"
  on public.activities for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.activities to authenticated;
