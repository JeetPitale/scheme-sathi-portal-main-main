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
            // Remove orderBy('name') to ensure documents missing the field are still returned
            const q = query(collection(db, COLLECTION));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => {
                const d = doc.data();
                return { 
                    id: doc.id, 
                    ...d,
                    // Map legacy field names if needed
                    name: d.name || d.scheme_name || "Untitled Scheme",
                    status: d.status || 'active',
                    isScheme: true,
                    is_scheme: true,
                    governmentLevel: d.governmentLevel || d.government_level || 'Central'
                };
            });

            // Sort in memory
            data.sort((a, b) => a.name.localeCompare(b.name));

            _cache = data;
            _cacheTimestamp = Date.now();
            return _cache;
        } catch (error) {
            console.error('SchemeService.getAll error:', error);
            return [];
        }
    },

    async getAllActive() {
        const all = await this.getAll();
        return all.filter(s => s.status === 'active');
    },

    async getById(id) {
        try {
            const docRef = doc(db, COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const d = docSnap.data();
                return { 
                    id: docSnap.id, 
                    ...d,
                    name: d.name || d.scheme_name || "Untitled Scheme",
                    status: d.status || 'active',
                    isScheme: true,
                    is_scheme: true,
                    governmentLevel: d.governmentLevel || d.government_level || 'Central'
                };
            }
            return null;
        } catch (error) {
            console.error(`SchemeService.getById(${id}) error:`, error);
            return null;
        }
    },

    async getBySlug(slug) {
        try {
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
            // Fallback: search by generated slug from name or scheme_name if direct slug match fails
            const all = await this.getAll();
            return all.find(s => 
                s.slug === slug || 
                (s.name && s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) ||
                (s.scheme_name && s.scheme_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug)
            ) || null;
        } catch (error) {
            console.error(`SchemeService.getBySlug(${slug}) error:`, error);
            return null;
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
