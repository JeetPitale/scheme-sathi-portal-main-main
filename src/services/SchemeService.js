/**
 * SchemeService — CRUD for government schemes
 * Backed by Supabase `schemes` table.
 */

import { supabase } from '@/lib/supabase';

const TABLE = 'schemes';

// ── In-memory cache ──
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

// ── Public API ──
const SchemeService = {
    /**
     * Legacy seed method — now just ensures data exists or performs initial fetch.
     */
    async seed() {
        return this.getAll();
    },

    /** Get all schemes */
    async getAll() {
        if (isCacheValid()) return _cache;

        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('SchemeService.getAll error:', error);
            return [];
        }

        _cache = data || [];
        _cacheTimestamp = Date.now();
        return _cache;
    },

    /** Only active schemes */
    async getAllActive() {
        if (isCacheValid()) {
            return _cache.filter(s => s.status === 'active');
        }

        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('status', 'active')
            .order('name', { ascending: true });

        if (error) {
            console.error('SchemeService.getAllActive error:', error);
            return [];
        }
        return data || [];
    },

    /** Get a single scheme by its primary UUID `id` */
    async getById(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`SchemeService.getById(${id}) error:`, error);
            return null;
        }
        return data;
    },

    /** Get a single scheme by its unique `slug` */
    async getBySlug(slug) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`SchemeService.getBySlug(${slug}) error:`, error);
            return null;
        }
        return data;
    },

    /** Get featured schemes */
    async getFeatured(limit = 6) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('is_featured', true)
            .eq('status', 'active')
            .limit(limit);

        if (error) {
            console.error('SchemeService.getFeatured error:', error);
            return [];
        }
        return data || [];
    },

    /** Add a scheme */
    async add(schemeData) {
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .insert([{
                    ...schemeData,
                    status: schemeData.status || 'active'
                }])
                .select()
                .single();

            if (error) throw error;

            invalidateCache();
            return { success: true, scheme: data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /** Update a scheme by its `id` */
    async update(id, updates) {
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            invalidateCache();
            return { success: true, scheme: data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /** Delete a scheme by its `id` */
    async remove(id) {
        try {
            const { error } = await supabase
                .from(TABLE)
                .delete()
                .eq('id', id);

            if (error) throw error;

            invalidateCache();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /** Toggle active/inactive */
    async toggleStatus(id) {
        const { data: existing, error: fetchError } = await supabase
            .from(TABLE)
            .select('status')
            .eq('id', id)
            .single();

        if (fetchError || !existing) return { success: false, error: 'Scheme not found' };

        const newStatus = existing.status === 'active' ? 'inactive' : 'active';
        return this.update(id, { status: newStatus });
    },

    /** Search schemes (Server-side) with pagination */
    async search(queryStr, page = 1, limit = 12) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from(TABLE)
            .select('*', { count: 'exact' })
            .or(`name.ilike.%${queryStr}%,description.ilike.%${queryStr}%,category.ilike.%${queryStr}%`)
            .eq('status', 'active')
            .order('name', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('SchemeService.search error:', error);
            return { data: [], count: 0 };
        }
        return { data: data || [], count: count || 0 };
    },

    /** Filter by category and/or state (Server-side) with pagination */
    async filter(filters, page = 1, limit = 12) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase.from(TABLE).select('*', { count: 'exact' });

        if (filters.category) query = query.eq('category', filters.category);
        if (filters.state) {
            if (filters.state !== 'central') {
                query = query.or(`state.eq.${filters.state},state.eq.central`);
            } else {
                query = query.eq('state', 'central');
            }
        }
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error, count } = await query
            .order('name', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('SchemeService.filter error:', error);
            return { data: [], count: 0 };
        }
        return { data: data || [], count: count || 0 };
    },

    invalidateCache,
};

export default SchemeService;
