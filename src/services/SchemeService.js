/**
 * SchemeService — CRUD for government schemes
 * Backed by Firebase `schemes` collection.
 */

import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    doc, 
    getDoc, 
    serverTimestamp,
    or
} from 'firebase/firestore';

const COLLECTION = 'schemes';
const LOCAL_SCHEMES = [
    {
        id: 'mock-1',
        name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
        description: 'National Mission for Financial Inclusion to ensure access to financial services, namely, basic savings & deposit accounts, remittance, credit, insurance, pension in an affordable manner.',
        category: 'tax-finance',
        state: 'central',
        government_level: 'Central',
        status: 'active',
        isScheme: true,
        is_scheme: true,
        slug: 'pm-jan-dhan-yojana',
        benefits: {
            financial_assistance: 'Interest on deposit, Accidental insurance cover of Rs.1 lakh, no minimum balance required.',
            non_financial_support: 'Access to pension and insurance products.'
        },
        eligibility: { minAge: 10, categories: ['Any', 'General', 'OBC', 'SC', 'ST'] },
        documents_required: ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Driving License']
    },
    {
        id: 'mock-2',
        name: 'Atal Pension Yojana (APY)',
        description: 'A pension scheme for citizens of India focused on the unorganized sector workers.',
        category: 'pensions',
        state: 'central',
        government_level: 'Central',
        status: 'active',
        isScheme: true,
        is_scheme: true,
        slug: 'atal-pension-yojana',
        benefits: {
            financial_assistance: 'Guaranteed minimum pension of Rs. 1,000 to Rs. 5,000 per month after age 60.',
            non_financial_support: 'Social security for old age.'
        },
        eligibility: { minAge: 18, maxAge: 60, categories: ['Any', 'General', 'OBC', 'SC', 'ST'] },
        documents_required: ['Aadhaar Card', 'Savings Bank Account']
    },
    {
        id: 'mock-3',
        name: 'PM-Kisan Samman Nidhi',
        description: 'An initiative by the government of India in which all farmers will get up to ₹6,000 per year as minimum income support.',
        category: 'agriculture',
        state: 'central',
        government_level: 'Central',
        status: 'active',
        isScheme: true,
        is_scheme: true,
        slug: 'pm-kisan-samman-nidhi',
        benefits: {
            financial_assistance: 'Direct income support of Rs. 6,000 per year in three equal installments.',
            non_financial_support: 'Financial stability for small and marginal farmers.'
        },
        eligibility: { categories: ['Any', 'Small and Marginal Farmers', 'General', 'OBC', 'SC', 'ST'], states: ['central'] },
        documents_required: ['Aadhaar Card', 'Land Holding Documents', 'Bank Account']
    }
];

let _cache = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
    return _cache && (Date.now() - _cacheTimestamp) < CACHE_TTL;
}

function invalidateCache() {
    _cache = null;
    _cacheTimestamp = 0;
}

const SchemeService = {
    async seed() {
        return this.getAll();
    },

    async getAll() {
        if (isCacheValid()) return _cache;

        try {
            // Add a timeout to firestore fetch to avoid hanging on poor connections
            const fetchPromise = (async () => {
                const q = query(collection(db, COLLECTION));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => {
                    const d = doc.data();
                    return { 
                        id: doc.id, 
                        ...d,
                        name: d.name || d.scheme_name || "Untitled Scheme",
                        status: d.status || 'active',
                        isScheme: true,
                        is_scheme: true,
                        governmentLevel: d.governmentLevel || d.government_level || 'Central'
                    };
                });
            })();

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Firestore fetch timeout')), 5000)
            );

            const firestoreData = await Promise.race([fetchPromise, timeoutPromise]);

            // Combine local schemes with firestore schemes
            const seededNames = new Set(firestoreData.map(s => (s.name || '').toLowerCase()));
            const uniqueLocal = LOCAL_SCHEMES.filter(ls => !seededNames.has(ls.name.toLowerCase()));
            
            const data = [...firestoreData, ...uniqueLocal];
            data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            _cache = data;
            _cacheTimestamp = Date.now();
            return _cache;
        } catch (error) {
            console.error('SchemeService.getAll fallback activated:', error.message);
            // Return local schemes as fallback on fatal error or timeout
            const fallbackData = LOCAL_SCHEMES.map(ls => ({
                ...ls,
                name: ls.name || ls.scheme_name || "Untitled Scheme",
                status: ls.status || 'active',
                isScheme: true,
                is_scheme: true,
                governmentLevel: ls.governmentLevel || ls.government_level || 'Central'
            }));
            _cache = fallbackData;
            return fallbackData;
        }
    },

    async getAllActive() {
        const all = await this.getAll();
        return all.filter(s => s.status === 'active');
    },

    async getById(id) {
        try {
            const fetchPromise = (async () => {
                const docRef = doc(db, COLLECTION, id);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    const d = snapshot.data();
                    return { 
                        id: snapshot.id, 
                        ...d,
                        name: d.name || d.scheme_name || "Untitled Scheme",
                        status: d.status || 'active',
                        isScheme: true,
                        is_scheme: true,
                        governmentLevel: d.governmentLevel || d.government_level || 'Central'
                    };
                }
                return null;
            })();

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Firestore fetch timeout')), 5000)
            );

            const result = await Promise.race([fetchPromise, timeoutPromise]);
            if (result) return result;

            // Fallback to local schemes if not in Firestore
            const local = LOCAL_SCHEMES.find(ls => ls.id === id);
            if (local) return local;

            return null;
        } catch (error) {
            console.error(`SchemeService.getById(${id}) fallback activated:`, error.message);
            return LOCAL_SCHEMES.find(ls => ls.id === id) || null;
        }
    },

    async getBySlug(slug) {
        try {
            const fetchPromise = (async () => {
                const q = query(collection(db, COLLECTION), where('slug', '==', slug), limit(1));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    const d = doc.data();
                    return { 
                        id: doc.id, 
                        ...d,
                        name: d.name || d.scheme_name || "Untitled Scheme",
                        status: d.status || 'active',
                        isScheme: true,
                        is_scheme: true,
                        governmentLevel: d.governmentLevel || d.government_level || 'Central'
                    };
                }
                return null;
            })();

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Firestore fetch timeout')), 5000)
            );

            const result = await Promise.race([fetchPromise, timeoutPromise]);
            if (result) return result;

            // Fallback: search by generated slug from name or scheme_name if direct slug match fails
            const all = await this.getAll();
            return all.find(s => 
                s.slug === slug || 
                (s.name && s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) ||
                (s.scheme_name && s.scheme_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug)
            ) || null;
        } catch (error) {
            console.error(`SchemeService.getBySlug(${slug}) fallback activated:`, error.message);
            // On timeout, we must use local data
            const all = await this.getAll(); // This already handles fallback/timeout
            return all.find(s => 
                s.slug === slug || 
                (s.name && (s.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug)
            ) || null;
        }
    },

    async getFeatured(limitCount = 6) {
        const all = await this.getAllActive();
        return all.filter(s => s.is_featured === true).slice(0, limitCount);
    },

    async add(schemeData) {
        try {
            const slug = schemeData.slug || (schemeData.name || schemeData.scheme_name || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const newScheme = {
                ...schemeData,
                slug,
                isScheme: true,
                is_scheme: true,
                status: schemeData.status || 'active',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            };
            const docRef = await addDoc(collection(db, COLLECTION), newScheme);
            const snapshot = await getDoc(docRef);

            invalidateCache();
            return { success: true, scheme: { id: docRef.id, ...snapshot.data() } };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    async update(id, updates) {
        try {
            const docRef = doc(db, COLLECTION, id);
            await updateDoc(docRef, { 
                ...updates, 
                updated_at: serverTimestamp() 
            });

            invalidateCache();
            const snapshot = await getDoc(docRef);
            return { success: true, scheme: { id, ...snapshot.data() } };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    async remove(id) {
        try {
            const docRef = doc(db, COLLECTION, id);
            await deleteDoc(docRef);
            invalidateCache();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    async toggleStatus(id) {
        const scheme = await this.getById(id);
        if (!scheme) return { success: false, error: 'Scheme not found' };

        const newStatus = scheme.status === 'active' ? 'inactive' : 'active';
        return this.update(id, { status: newStatus });
    },

    async search(queryStr, page = 1, pageSize = 12) {
        try {
            const all = await this.getAllActive();
            
            const filtered = all.filter(s => 
                (s.name || '').toLowerCase().includes(queryStr.toLowerCase()) ||
                (s.scheme_name || '').toLowerCase().includes(queryStr.toLowerCase()) ||
                (s.description || '').toLowerCase().includes(queryStr.toLowerCase()) ||
                (s.category || '').toLowerCase().includes(queryStr.toLowerCase())
            );

            const start = (page - 1) * pageSize;
            const paginated = filtered.slice(start, start + pageSize);

            return { data: paginated, count: filtered.length };
        } catch (error) {
            console.error('SchemeService.search error:', error);
            return { data: [], count: 0 };
        }
    },

    async filter(filters, page = 1, pageSize = 12) {
        try {
            const all = await this.getAll();
            
            let filtered = all;

            if (filters.category) {
                filtered = filtered.filter(s => s.category === filters.category);
            }
            
            if (filters.state) {
                filtered = filtered.filter(s => {
                    if (filters.state === 'central') return s.state === 'central';
                    return s.state === filters.state || s.state === 'central';
                });
            }
            
            if (filters.status) {
                filtered = filtered.filter(s => s.status === filters.status);
            } else {
                // Default to showing active if filtered (active status might be missing on some docs)
                // Actually if no status filter, just show all
            }

            const start = (page - 1) * pageSize;
            const paginated = filtered.slice(start, start + pageSize);

            return { data: paginated, count: filtered.length };
        } catch (error) {
            console.error('SchemeService.filter error:', error);
            return { data: [], count: 0 };
        }
    },

    invalidateCache,
};

export default SchemeService;
