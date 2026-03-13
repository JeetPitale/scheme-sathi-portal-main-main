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
            const q = query(collection(db, COLLECTION), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            _cache = data;
            _cacheTimestamp = Date.now();
            return _cache;
        } catch (error) {
            console.error('SchemeService.getAll error:', error);
            return [];
        }
    },

    async getAllActive() {
        if (isCacheValid()) {
            return _cache.filter(s => s.status === 'active');
        }

        try {
            const q = query(
                collection(db, COLLECTION),
                where('status', '==', 'active'),
                orderBy('name', 'asc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('SchemeService.getAllActive error:', error);
            return [];
        }
    },

    async getById(id) {
        try {
            const docRef = doc(db, COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
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
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error(`SchemeService.getBySlug(${slug}) error:`, error);
            return null;
        }
    },

    async getFeatured(limitCount = 6) {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('is_featured', '==', true),
                where('status', '==', 'active'),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('SchemeService.getFeatured error:', error);
            return [];
        }
    },

    async add(schemeData) {
        try {
            const newScheme = {
                ...schemeData,
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
            // Note: Cloud Firestore does not support native full-text search or ilike
            // For small datasets, we fetch all active and filter in memory
            const q = query(
                collection(db, COLLECTION),
                where('status', '==', 'active'),
                orderBy('name', 'asc')
            );
            const snapshot = await getDocs(q);
            const allActive = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const filtered = allActive.filter(s => 
                (s.name || '').toLowerCase().includes(queryStr.toLowerCase()) ||
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
            let q = query(collection(db, COLLECTION));

            if (filters.category) q = query(q, where('category', '==', filters.category));
            if (filters.state) {
                if (filters.state !== 'central') {
                    q = query(q, or(where('state', '==', filters.state), where('state', '==', 'central')));
                } else {
                    q = query(q, where('state', '==', 'central'));
                }
            }
            if (filters.status) q = query(q, where('status', '==', filters.status));

            q = query(q, orderBy('name', 'asc'));

            const snapshot = await getDocs(q);
            const allFiltered = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const start = (page - 1) * pageSize;
            const paginated = allFiltered.slice(start, start + pageSize);

            return { data: paginated, count: allFiltered.length };
        } catch (error) {
            console.error('SchemeService.filter error:', error);
            return { data: [], count: 0 };
        }
    },

    invalidateCache,
};

export default SchemeService;
