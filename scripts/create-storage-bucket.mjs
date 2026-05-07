import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = 'autos-images';

if (!supabaseUrl) {
  console.error('Falta VITE_SUPABASE_URL.');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();

if (listError) {
  console.error(`No se pudieron listar buckets: ${listError.message}`);
  process.exit(1);
}

if (buckets?.some(item => item.id === bucket)) {
  console.log(`Bucket ya existe: ${bucket}`);
  process.exit(0);
}

const { error: createError } = await supabase.storage.createBucket(bucket, {
  public: true,
  fileSizeLimit: 8 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

if (createError) {
  console.error(`No se pudo crear bucket ${bucket}: ${createError.message}`);
  process.exit(1);
}

console.log(`Bucket creado: ${bucket}`);
