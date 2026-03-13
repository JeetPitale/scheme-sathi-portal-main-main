/**
 * Execute all SQL batches via Supabase service role key
 * This bypasses RLS policies
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
const envPath = join(__dirname, '..', '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
    }
    env[key] = value;
});

const supabaseUrl = env.VITE_SUPABASE_URL;
// Try service role key first, fall back to anon key
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase keys in .env');
    process.exit(1);
}

console.log(`Using key type: ${env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🚀 Executing SQL batches...\n');

    for (let i = 1; i <= 9; i++) {
        const sqlPath = `C:/tmp/schemes_batch_${i}.sql`;
        const sql = readFileSync(sqlPath, 'utf-8');

        console.log(`📦 Batch ${i}/9...`);

        const { data, error } = await supabase.rpc('exec_sql', { query: sql }).maybeSingle();

        if (error) {
            // Fallback: try direct insert approach
            console.log(`  ℹ️  RPC not available, trying direct approach...`);

            // We'll just use the REST API's raw SQL endpoint
            const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: sql })
            });

            if (!res.ok) {
                console.log(`  ❌ Batch ${i} failed: ${error.message}`);
            } else {
                console.log(`  ✅ Batch ${i} done`);
            }
        } else {
            console.log(`  ✅ Batch ${i} done`);
        }
    }

    // Verify count
    const { count } = await supabase.from('schemes').select('*', { count: 'exact', head: true });
    console.log(`\n📊 Total schemes in database: ${count}`);
}

main().catch(err => {
    console.error('💥 Failed:', err);
    process.exit(1);
});
