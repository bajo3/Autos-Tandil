import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL no esta configurado.');
  process.exit(1);
}

const sqlPath = path.resolve('supabase/migrations/003_create_auctions.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  console.log('Migracion subastas aplicada: 003_create_auctions.sql');

  const adminEmail = process.env.AUCTIONS_ADMIN_EMAIL;
  if (adminEmail) {
    const result = await client.query(
      `insert into public.admins (user_id, email)
       select id, email from auth.users where email = $1
       on conflict (user_id) do nothing
       returning user_id`,
      [adminEmail],
    );
    if (result.rowCount) {
      console.log(`Admin agregado: ${adminEmail}`);
    } else {
      console.log(`No se encontro auth.user con email ${adminEmail}; registralo primero y volve a correr.`);
    }
  } else {
    console.log('Tip: definí AUCTIONS_ADMIN_EMAIL para autopromover un usuario a admin.');
  }
} finally {
  await client.end();
}
