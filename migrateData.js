// import { createClient } from "@supabase/supabase-js";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Parse .env manually for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    acc[key.trim()] = values.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
  return acc;
}, {});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

// const supabase = createClient(supabaseUrl, supabaseKey);

const firebaseConfig = {
  projectId: "scheme-sarthi-v2",
  appId: "1:448698971840:web:3e47a3968a875cf8c29f25",
  storageBucket: "scheme-sarthi-v2.firebasestorage.app",
  apiKey: "AIzaSyBlH5BXTxDct_WsjJrYeA_YwE_hxEC0avE",
  authDomain: "scheme-sarthi-v2.firebaseapp.com",
  messagingSenderId: "448698971840"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tablesToFetch = ["schemes", "audit_logs", "notifications"];
const localTables = ["profiles", "applications"];

async function migrate() {
  // Migrate from local JSON dumps
  for (const table of localTables) {
    console.log(`Migrating local table: ${table}`);
    try {
      const dataStr = fs.readFileSync(path.resolve(process.cwd(), `${table}_dump.json`), 'utf-8');
      const data = JSON.parse(dataStr);
      console.log(`Found ${data.length} records in ${table}`);
      let count = 0;
      for (const record of data) {
        try {
          const id = record.id;
          delete record.id;
          await setDoc(doc(db, table, id), record);
          count++;
        } catch (err) {
          console.error(`Error saving record to ${table}:`, err.message);
        }
      }
      console.log(`Successfully migrated ${count} records for ${table}`);
    } catch (e) {
      console.error(`Could not read/migrate local dump for ${table}:`, e.message);
    }
  }

  // Migrate directly from Supabase
  for (const table of tablesToFetch) {
    console.log(`Migrating table from Supabase: ${table}`);
    let { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
      continue;
    }
    
    console.log(`Found ${data.length} records in ${table}`);
    let count = 0;
    for (const record of data) {
      try {
        const id = record.id;
        delete record.id;
        await setDoc(doc(db, table, id), record);
        count++;
      } catch (err) {
        console.error(`Error saving record to ${table}:`, err.message);
      }
    }
    console.log(`Successfully migrated ${count} records for ${table}`);
  }
  
  console.log("Migration complete!");
  process.exit(0);
}

migrate();
