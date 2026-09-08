-- 랜딩 사진/로고용 공개 버킷
-- Supabase SQL Editor에서 한 번 실행하세요.

insert into storage.buckets (id, name, public)
values ('dojang-media', 'dojang-media', true)
on conflict (id) do nothing;

drop policy if exists "dojang_media_public_read" on storage.objects;
create policy "dojang_media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'dojang-media');

drop policy if exists "dojang_media_authenticated_insert" on storage.objects;
create policy "dojang_media_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'dojang-media');

drop policy if exists "dojang_media_authenticated_update" on storage.objects;
create policy "dojang_media_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'dojang-media')
  with check (bucket_id = 'dojang-media');
