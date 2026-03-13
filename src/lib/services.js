// ─── Service categories and states ───
export const serviceCategories = [
    { id: 'pensions', icon: '🏦', nameKey: 'pensions' },
    { id: 'social-welfare', icon: '🤝', nameKey: 'socialWelfare' },
    { id: 'transport', icon: '🚗', nameKey: 'transport' },
    { id: 'utilities', icon: '💡', nameKey: 'utilities' },
    { id: 'tax-finance', icon: '💰', nameKey: 'taxFinance' },
    { id: 'health', icon: '🏥', nameKey: 'health' },
    { id: 'education', icon: '🎓', nameKey: 'education' },
    { id: 'agriculture', icon: '🌾', nameKey: 'agriculture' },
    { id: 'women-empowerment', icon: '👩', nameKey: 'womenEmpowerment' },
    { id: 'msme', icon: '🏭', nameKey: 'msme' },
    { id: 'startup', icon: '🚀', nameKey: 'startup' },
    { id: 'housing', icon: '🏠', nameKey: 'housing' },
    { id: 'pension-scheme', icon: '👴', nameKey: 'pensionScheme' },
    { id: 'skill-development', icon: '🛠️', nameKey: 'skillDevelopment' },
    { id: 'disability', icon: '♿', nameKey: 'disability' },
    { id: 'minority', icon: '🕌', nameKey: 'minority' },
    { id: 'tribal-welfare', icon: '🌿', nameKey: 'tribalWelfare' },
    { id: 'youth', icon: '🧑‍💼', nameKey: 'youth' },
    { id: 'digital-india', icon: '💻', nameKey: 'digitalIndia' },
];

export const states = [
    { id: 'central', name: 'Central Government' },
    { id: 'maharashtra', name: 'Maharashtra' },
    { id: 'gujarat', name: 'Gujarat' },
    { id: 'karnataka', name: 'Karnataka' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'tamilnadu', name: 'Tamil Nadu' },
    { id: 'kerala', name: 'Kerala' },
    { id: 'westbengal', name: 'West Bengal' },
    { id: 'rajasthan', name: 'Rajasthan' },
    { id: 'punjab', name: 'Punjab' },
    { id: 'telangana', name: 'Telangana' },
    { id: 'andhrapradesh', name: 'Andhra Pradesh' },
    { id: 'uttarpradesh', name: 'Uttar Pradesh' },
    { id: 'madhyapradesh', name: 'Madhya Pradesh' },
    { id: 'bihar', name: 'Bihar' },
    { id: 'odisha', name: 'Odisha' },
    { id: 'jharkhand', name: 'Jharkhand' },
    { id: 'chhattisgarh', name: 'Chhattisgarh' },
    { id: 'assam', name: 'Assam' },
    { id: 'himachalpradesh', name: 'Himachal Pradesh' },
    { id: 'uttarakhand', name: 'Uttarakhand' },
    { id: 'haryana', name: 'Haryana' },
];

// NOTE: All scheme data has been migrated to Supabase.
// Use SchemeService and useSchemeStore for fetching data.
export const services = [];

// Legacy helper functions — mostly deprecated as we moved to Supabase/Zustand
export const getServicesByCategory = (categoryId) => {
    return services.filter((s) => s.category === categoryId);
};

export const getServiceById = (id) => {
    return services.find((s) => s.id === id);
};

export const searchServices = (query) => {
    const lowerQuery = query.toLowerCase();
    return services.filter((s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.category.toLowerCase().includes(lowerQuery)
    );
};

export const filterServices = (filters) => {
    return services.filter((s) => {
        if (filters.category && s.category !== filters.category)
            return false;
        if (filters.state && s.state !== filters.state && s.state !== 'central')
            return false;
        return true;
    });
};
