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

await client.connect();
try {
  const { rows } = await client.query(
    'select id, name, public from storage.buckets where id = $1 limit 1;',
    [bucket],
  );

  if (!rows.length) {
    console.log(`Bucket no encontrado: ${bucket}`);
    process.exitCode = 2;
  } else {
    const found = rows[0];
    console.log(`Bucket encontrado: ${found.id}. public=${found.public}`);
  }
} finally {
  await client.end();
}
