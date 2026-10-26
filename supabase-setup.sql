-- ============================================================
-- Van.dev Portfolio — Supabase Setup
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. Submissions table
create table if not exists contact_submissions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text        not null,
  email       text        not null,
  subject     text        not null,
  message     text        not null,
  files       jsonb       not null default '[]'::jsonb,
  read        boolean     not null default false
);

-- 2. RLS — anon can INSERT only (cannot read, update, delete)
alter table contact_submissions enable row level security;

drop policy if exists "anon can submit" on contact_submissions;
create policy "anon can submit" on contact_submissions
  for insert to anon with check (true);

-- 3. Storage bucket (skip if already created via API)
insert into storage.buckets (id, name, public)
values ('contact-attachments', 'contact-attachments', false)
on conflict (id) do nothing;

-- 4. Anon can upload to the bucket
drop policy if exists "anon can upload attachments" on storage.objects;
create policy "anon can upload attachments" on storage.objects
  for insert to anon with check (bucket_id = 'contact-attachments');

-- 6. Social field (Facebook / Instagram name) — run if table already existed
alter table contact_submissions add column if not exists social text not null default '';

-- 5. Service role can read/delete files (used by admin backend)
drop policy if exists "service role full access" on storage.objects;
create policy "service role full access" on storage.objects
  for all to service_role using (bucket_id = 'contact-attachments');
