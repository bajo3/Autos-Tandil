import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'autos-images';

if (!databaseUrl) {
  console.error('DATABASE_URL no esta configurado.');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const sql = `
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'autos_images_public_read'
  ) then
    create policy autos_images_public_read
    on storage.objects
    for select
    to public
    using (bucket_id = '${bucket}');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'autos_images_anon_insert'
  ) then
    create policy autos_images_anon_insert
    on storage.objects
    for insert
    to anon
    with check (
      bucket_id = '${bucket}'
      and lower((storage.foldername(name))[1]) = 'autos'
    );
  end if;
end
$$;
`;

await client.connect();
try {
  await client.query(sql);
  console.log(`Policies de Storage listas para bucket: ${bucket}`);
} finally {
  await client.end();
}
