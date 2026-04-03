/**
 * SchemeService — CRUD for government schemes
 * Backed by Node.js/MongoDB REST API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const getApiUrl = () => API_URL;

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
            const res = await fetch(`${getApiUrl()}/schemes`);
            if (!res.ok) {
                throw new Error(`Failed to fetch from backend: ${res.status}`);
            }
            const data = await res.json();

            // Normalize data to work with existing frontend components
            const normalizedData = data.map(d => {
                let normalizedCategory = d.category || 'general';
                normalizedCategory = normalizedCategory.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
                
                // Map backend 'rules' to frontend 'eligibility'
                // and 'documents' to 'documents_required'
                return { 
                    ...d,
                    id: d._id || d.id,
                    category: normalizedCategory,
                    name: d.name || d.scheme_name || "Untitled Scheme",
                    status: d.status || 'active',
                    isScheme: true,
                    is_scheme: true,
                    governmentLevel: d.governmentLevel || d.government_level || (d.state === 'central' ? 'Central' : 'State'),
                    
                    // Unified field mappings
                    eligibility: d.eligibility || d.rules || {},
                    documents_required: d.documents_required || d.documents || [],
                    benefits: d.benefits || (d.benefitAmount ? `Financial assistance of ₹${d.benefitAmount}` : null)
                };
            });

            normalizedData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            _cache = normalizedData;
            _cacheTimestamp = Date.now();
            return _cache;
        } catch (error) {
            console.error('SchemeService.getAll error:', error.message);
            // In case the backend completely fails, return an empty array instead of crashing
            return [];
        }
    },

    async getAllActive() {
        const all = await this.getAll();
        return all.filter(s => s.status === 'active');
    },

    async getById(id) {
        try {
            const all = await this.getAll();
            return all.find(s => s.id === id || s._id === id) || null;
        } catch (error) {
            console.error(`SchemeService.getById(${id}) error:`, error.message);
            return null;
        }
    },

    async getBySlug(slug) {
        try {
            const all = await this.getAll();
            return all.find(s => 
                s.slug === slug || 
                s.id === slug ||
                s._id === slug ||
                (s.name && s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) ||
                (s.scheme_name && s.scheme_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug)
            ) || null;
        } catch (error) {
            console.error(`SchemeService.getBySlug(${slug}) error:`, error.message);
            return null;
        }
    },

    async getFeatured(limitCount = 6) {
        const all = await this.getAllActive();
        return all.filter(s => s.is_featured === true).slice(0, limitCount);
    },

    // ── NOTE: The below methods (add, update, remove, toggle) require backend POST/PUT/DELETE routes. 
    // They are currently mocked to prevent crashes until the backend implements them.
    
    async add(schemeData) {
        console.warn("Backend add route not implemented yet!");
        return { success: false, error: "Not implemented in MongoDB backend yet" };
    },

    async update(id, updates) {
        console.warn("Backend update route not implemented yet!");
        return { success: false, error: "Not implemented in MongoDB backend yet" };
    },

    async remove(id) {
        console.warn("Backend remove route not implemented yet!");
        return { success: false, error: "Not implemented in MongoDB backend yet" };
    },

    async toggleStatus(id) {
        console.warn("Backend toggle status route not implemented yet!");
        return { success: false, error: "Not implemented in MongoDB backend yet" };
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

