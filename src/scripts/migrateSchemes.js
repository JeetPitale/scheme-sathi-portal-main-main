/**
 * One-time migration script: Insert all schemes from JSON into Supabase
 * 
 * Usage: node src/scripts/migrateSchemes.js
 * 
 * Idempotent: uses upsert with slug as conflict key.
 * Batched: inserts 50 at a time to avoid timeouts.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Load env from .env file manually ──
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
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
    }
    env[key] = value;
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Slug generator ──
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')   // remove non-word chars except spaces and hyphens
        .replace(/\s+/g, '-')       // spaces to hyphens
        .replace(/-+/g, '-')        // collapse multiple hyphens
        .replace(/^-|-$/g, '');     // trim hyphens from ends
}

// ── Category / State Mappings (same as SchemeService) ──
const categoryMap = {
    'Health': 'health', 'Education': 'education', 'Agriculture': 'agriculture',
    'Women Empowerment': 'women-empowerment', 'MSME': 'msme', 'Startup': 'startup',
    'Housing': 'housing', 'Pension': 'pension-scheme', 'Skill Development': 'skill-development',
    'Disability': 'disability', 'Minority': 'minority', 'Tribal Welfare': 'tribal-welfare',
    'Youth': 'youth', 'Digital India': 'digital-india',
};

const stateIdMap = {
    'All India': 'central', 'Gujarat': 'gujarat', 'Maharashtra': 'maharashtra',
    'Rajasthan': 'rajasthan', 'Madhya Pradesh': 'madhyapradesh', 'Uttar Pradesh': 'uttarpradesh',
    'Tamil Nadu': 'tamilnadu', 'Karnataka': 'karnataka', 'Kerala': 'kerala',
    'West Bengal': 'westbengal', 'Bihar': 'bihar', 'Odisha': 'odisha',
    'Andhra Pradesh': 'andhrapradesh', 'Telangana': 'telangana', 'Punjab': 'punjab',
    'Haryana': 'haryana', 'Jharkhand': 'jharkhand', 'Chhattisgarh': 'chhattisgarh',
    'Assam': 'assam', 'Himachal Pradesh': 'himachalpradesh', 'Uttarakhand': 'uttarakhand',
};

// ── Original non-welfare services ──
const originalServices = [
    { id: 'epf-balance', name: 'Check EPF Balance', description: 'View your Employee Provident Fund balance and recent contributions', category: 'pensions', eligibility: 'Any EPF member with UAN', documents: ['UAN Number', 'Aadhaar Card'], state: 'central' },
    { id: 'epf-claim', name: 'EPF Withdrawal Claim', description: 'Submit a claim for EPF withdrawal', category: 'pensions', eligibility: 'EPF members who have left employment', documents: ['UAN Number', 'Bank Account Details', 'Aadhaar Card', 'PAN Card'], state: 'central' },
    { id: 'pension-status', name: 'Pension Status Check', description: 'Check the status of your pension application', category: 'pensions', eligibility: 'Retired employees who have applied for pension', documents: ['PPO Number', 'Aadhaar Card'], state: 'central' },
    { id: 'atal-pension', name: 'Atal Pension Yojana', description: 'Guaranteed pension scheme for unorganized sector workers', category: 'pensions', eligibility: 'Indian citizens aged 18-40 with bank account', documents: ['Aadhaar Card', 'Bank Account Details', 'Mobile Number'], state: 'central' },
    { id: 'old-age-pension', name: 'Old Age Pension Scheme', description: 'Monthly pension for senior citizens above 60 years', category: 'pensions', eligibility: 'Citizens above 60 years with income below poverty line', documents: ['Aadhaar Card', 'Age Proof', 'Income Certificate', 'Bank Account'], state: 'central' },
    { id: 'varishtha-pension', name: 'Varishtha Pension Bima Yojana', description: 'Pension scheme for senior citizens with assured returns', category: 'pensions', eligibility: 'Senior citizens above 60 years', documents: ['Aadhaar Card', 'Age Proof', 'PAN Card', 'Bank Account'], state: 'central' },
    { id: 'driving-license', name: 'Driving License Application', description: 'Apply for new driving license or renewal', category: 'transport', eligibility: 'Indian citizens above 18 years', documents: ['Aadhaar Card', 'Address Proof', 'Passport Photo', 'Medical Certificate'], state: 'central' },
    { id: 'vehicle-registration', name: 'Vehicle Registration (RC)', description: 'Register new vehicle or transfer ownership', category: 'transport', eligibility: 'Vehicle owners', documents: ['Invoice', 'Insurance', 'Aadhaar Card', 'Address Proof'], state: 'delhi' },
    { id: 'international-dl', name: 'International Driving Permit', description: 'Apply for International Driving Permit', category: 'transport', eligibility: 'Valid Indian DL holders travelling abroad', documents: ['Valid DL', 'Passport', 'Passport Photos', 'Travel Documents'], state: 'central' },
    { id: 'learner-license', name: 'Learner License Application', description: 'Apply for learner driving license', category: 'transport', eligibility: 'Indian citizens above 16 years (for motorcycle without gear)', documents: ['Aadhaar Card', 'Age Proof', 'Passport Photo', 'Address Proof'], state: 'central' },
    { id: 'vehicle-fitness', name: 'Vehicle Fitness Certificate', description: 'Renew fitness certificate for commercial vehicles', category: 'transport', eligibility: 'Commercial vehicle owners', documents: ['RC Book', 'Insurance', 'Pollution Certificate', 'Tax Receipt'], state: 'central' },
    { id: 'fastag', name: 'FASTag Application', description: 'Apply for FASTag for electronic toll collection', category: 'transport', eligibility: 'All vehicle owners', documents: ['RC Book', 'Aadhaar Card', 'Passport Photo'], state: 'central' },
    { id: 'e-challan', name: 'E-Challan Payment', description: 'Pay traffic violation challans online', category: 'transport', eligibility: 'Anyone with pending traffic challan', documents: ['Challan Number', 'Vehicle Number'], state: 'central' },
    { id: 'electricity-bill', name: 'Pay Electricity Bill', description: 'Pay your electricity bill online', category: 'utilities', eligibility: 'All electricity consumers', documents: ['Consumer Number', 'Bill Copy'], state: 'central' },
    { id: 'gas-booking', name: 'LPG Gas Booking', description: 'Book LPG cylinder refill online', category: 'utilities', eligibility: 'LPG connection holders', documents: ['Consumer Number', 'Registered Mobile'], state: 'central' },
    { id: 'water-bill', name: 'Pay Water Bill', description: 'Pay your municipal water bill', category: 'utilities', eligibility: 'All water connection holders', documents: ['Consumer Number'], state: 'maharashtra' },
    { id: 'new-electricity', name: 'New Electricity Connection', description: 'Apply for new electricity connection', category: 'utilities', eligibility: 'Property owners without electricity connection', documents: ['Property Documents', 'Aadhaar Card', 'NOC from Society', 'Passport Photo'], state: 'central' },
    { id: 'new-water', name: 'New Water Connection', description: 'Apply for new municipal water connection', category: 'utilities', eligibility: 'Property owners without water connection', documents: ['Property Documents', 'Aadhaar Card', 'Building Plan Approval'], state: 'central' },
    { id: 'gas-subsidy', name: 'LPG Subsidy Status', description: 'Check LPG subsidy credit status', category: 'utilities', eligibility: 'LPG consumers enrolled in DBTL', documents: ['LPG Consumer Number', 'Aadhaar Number'], state: 'central' },
    { id: 'piped-gas', name: 'PNG Connection Application', description: 'Apply for Piped Natural Gas connection', category: 'utilities', eligibility: 'Residents in PNG service areas', documents: ['Property Documents', 'Aadhaar Card', 'NOC', 'Passport Photo'], state: 'central' },
    { id: 'income-tax', name: 'File Income Tax Return', description: 'File your annual income tax return online', category: 'tax-finance', eligibility: 'All taxpayers', documents: ['PAN Card', 'Aadhaar Card', 'Form 16', 'Bank Statements'], state: 'central' },
    { id: 'jan-dhan', name: 'Jan Dhan Account', description: 'Open zero-balance bank account under PMJDY', category: 'tax-finance', eligibility: 'Indian citizens without bank account', documents: ['Aadhaar Card', 'Passport Photo'], state: 'central' },
    { id: 'nps', name: 'National Pension System', description: 'Open NPS account for retirement savings', category: 'tax-finance', eligibility: 'Indian citizens aged 18-65', documents: ['Aadhaar Card', 'PAN Card', 'Bank Account Details'], state: 'central' },
    { id: 'pan-card', name: 'PAN Card Application', description: 'Apply for new PAN card or correction', category: 'tax-finance', eligibility: 'All Indian citizens and entities', documents: ['Aadhaar Card', 'Passport Photo', 'Address Proof'], state: 'central' },
    { id: 'gst-registration', name: 'GST Registration', description: 'Register for Goods and Services Tax', category: 'tax-finance', eligibility: 'Businesses with turnover above threshold', documents: ['PAN Card', 'Aadhaar Card', 'Business Proof', 'Bank Account', 'Photos'], state: 'central' },
    { id: 'pm-svanidhi', name: 'PM SVANidhi Scheme', description: 'Micro loans for street vendors', category: 'tax-finance', eligibility: 'Street vendors with certificate of vending', documents: ['Vending Certificate', 'Aadhaar Card', 'Bank Account', 'Passport Photo'], state: 'central' },
    { id: 'stand-up-india', name: 'Stand Up India Loan', description: 'Loans for SC/ST and women entrepreneurs', category: 'tax-finance', eligibility: 'SC/ST/Women entrepreneurs above 18 years', documents: ['Caste Certificate', 'Business Plan', 'Aadhaar Card', 'Bank Statements'], state: 'central' },
    { id: 'ppf', name: 'Public Provident Fund Account', description: 'Long-term savings with tax benefits', category: 'tax-finance', eligibility: 'All Indian citizens', documents: ['Aadhaar Card', 'PAN Card', 'Passport Photo', 'Address Proof'], state: 'central' },
    { id: 'tax-refund', name: 'Income Tax Refund Status', description: 'Check status of your income tax refund', category: 'tax-finance', eligibility: 'Taxpayers who have filed returns', documents: ['PAN Card', 'Acknowledgment Number'], state: 'central' },
    { id: 'property-tax', name: 'Pay Property Tax', description: 'Pay your municipal property tax online', category: 'tax-finance', eligibility: 'All property owners', documents: ['Property ID', 'Previous Receipt'], state: 'central' },
];

// ── Transform JSON scheme ──
function transformJsonScheme(scheme) {
    return {
        name: scheme.scheme_name,
        slug: slugify(scheme.scheme_name),
        description: scheme.benefits?.financial_assistance || '',
        category: categoryMap[scheme.category] || scheme.category.toLowerCase().replace(/\s+/g, '-'),
        state: stateIdMap[scheme.state] || scheme.state.toLowerCase().replace(/\s+/g, ''),
        eligibility: `${scheme.target_beneficiaries} | ${scheme.age_criteria} | Income limit: ${scheme.income_limit}`,
        documents_required: JSON.stringify(scheme.required_documents),
        government_level: scheme.government_level,
        target_beneficiaries: scheme.target_beneficiaries,
        benefits: JSON.stringify(scheme.benefits),
        application_process: scheme.application_mode,
        status: 'active',
        is_featured: (scheme.priority_score || 0) >= 80,
    };
}

// ── Transform original service ──
function transformOriginalService(s) {
    return {
        name: s.name,
        slug: slugify(s.name),
        description: s.description,
        category: s.category,
        state: s.state,
        eligibility: s.eligibility,
        documents_required: JSON.stringify(s.documents),
        status: 'active',
        is_featured: false,
    };
}

// ── Ensure unique slugs ──
function ensureUniqueSlugs(records) {
    const seen = new Map();
    return records.map(r => {
        let slug = r.slug;
        if (seen.has(slug)) {
            const count = seen.get(slug) + 1;
            seen.set(slug, count);
            slug = `${slug}-${count}`;
        } else {
            seen.set(slug, 1);
        }
        return { ...r, slug };
    });
}

// ── Batch insert ──
async function batchUpsert(records, batchSize = 50) {
    let success = 0;
    let failed = 0;

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(records.length / batchSize);

        console.log(`  📦 Batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

        const { data, error } = await supabase
            .from('schemes')
            .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false })
            .select('id');

        if (error) {
            console.error(`  ❌ Batch ${batchNum} failed:`, error.message);
            failed += batch.length;
        } else {
            success += (data?.length || batch.length);
        }
    }

    return { success, failed };
}

// ── Main ──
async function main() {
    console.log('🚀 Starting scheme migration to Supabase...\n');

    // Load JSON
    const jsonPath = join(__dirname, '..', 'data', 'schemes.json');
    const raw = readFileSync(jsonPath, 'utf-8');
    const schemesJson = JSON.parse(raw);
    console.log(`📄 Loaded ${schemesJson.length} schemes from schemes.json`);

    // Transform
    const jsonSchemes = schemesJson.map(transformJsonScheme);
    const serviceSchemes = originalServices.map(transformOriginalService);
    const allSchemes = ensureUniqueSlugs([...serviceSchemes, ...jsonSchemes]);
    console.log(`🔧 Total records to upsert: ${allSchemes.length}\n`);

    // Upsert
    const { success, failed } = await batchUpsert(allSchemes);

    console.log('\n════════════════════════════════════════');
    console.log(`✅ Successfully upserted: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${allSchemes.length}`);
    console.log('════════════════════════════════════════\n');

    if (failed === 0) {
        console.log('🎉 Migration completed successfully!');
    } else {
        console.log('⚠️  Some records failed. Check errors above.');
    }
}

main().catch(err => {
    console.error('💥 Migration failed:', err);
    process.exit(1);
});
