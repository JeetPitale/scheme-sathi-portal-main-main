/**
 * RecommendationService — Intelligent eligibility filtering and relevance scoring
 * for government schemes.
 */

const WEIGHTS = {
    STATE: 40,
    OCCUPATION: 30,
    INCOME: 20,
    AGE: 15,
    CATEGORY: 15,
    SPECIAL: 35, // Disability, Student, Farmer specifics
};

const RecommendationService = {
    /**
     * Recommends top schemes based on user profile and available schemes
     * @param {Object} userProfile - User input data
     * @param {Array} allSchemes - List of all active schemes from Firestore
     * @param {Array} appliedSchemeIds - IDs of schemes the user already applied for
     */
    recommend(userProfile, allSchemes, appliedSchemeIds = []) {
        console.log("[RecommendationEngine] Starting analysis for user:", userProfile.id || "guest");
        
        // 1. Filtering & Initial Scoring
        const results = allSchemes
            .filter(scheme => !appliedSchemeIds.includes(scheme.id)) // Avoid repeating applied schemes
            .map(scheme => {
                const analysis = this.evaluateEligibility(userProfile, scheme);
                return {
                    ...scheme,
                    recommendationData: analysis
                };
            })
            // Stage 1: Filter out ineligible
            .filter(item => item.recommendationData.isEligible)
            // Stage 2: Calculate Final Score
            .map(item => {
                const score = this.calculateRelevance(userProfile, item);
                return { ...item, relevanceScore: score };
            })
            // Stage 3: Rank
            .sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Return top 5
        return results.slice(0, 5);
    },

    /**
     * Evaluates hard eligibility constraints
     */
    evaluateEligibility(user, scheme) {
        const criteria = scheme.eligibility || {};
        const reasons = [];
        const failed = [];
        let isEligible = true;

        // Age Check
        if (criteria.minAge && user.age < criteria.minAge) {
            isEligible = false;
            failed.push(`Minimum age required is ${criteria.minAge}`);
        }
        if (criteria.maxAge && user.age > criteria.maxAge) {
            isEligible = false;
            failed.push(`Maximum age allowed is ${criteria.maxAge}`);
        }

        // Income Check
        if (criteria.maxIncome && user.income > criteria.maxIncome) {
            isEligible = false;
            failed.push(`Income must be below ₹${criteria.maxIncome}`);
        }

        // Gender Check
        if (criteria.gender && criteria.gender !== 'Any' && user.gender !== criteria.gender) {
            isEligible = false;
            failed.push(`Exclusively for ${criteria.gender} candidates`);
        }

        // State Check
        if (criteria.states && criteria.states.length > 0) {
            const userState = (user.state || '').toLowerCase();
            const allowedStates = criteria.states.map(s => s.toLowerCase());
            if (!allowedStates.includes('central') && !allowedStates.includes(userState)) {
                isEligible = false;
                failed.push(`Not available in ${user.state}`);
            }
        }

        // Category Check
        if (criteria.categories && criteria.categories.length > 0) {
            if (!criteria.categories.includes(user.category) && !criteria.categories.includes('Any')) {
                isEligible = false;
                failed.push(`Restricted to ${criteria.categories.join(', ')}`);
            }
        }

        // Setup Success Reasons for UI
        if (isEligible) {
            if (criteria.maxIncome) reasons.push("Your income qualifies");
            if (criteria.states) reasons.push(`Available in ${user.state || 'your state'}`);
            if (user.occupation && criteria.occupations?.includes(user.occupation)) reasons.push(`Matches your occupation (${user.occupation})`);
            reasons.push("Age eligibility satisfied");
        }

        return {
            isEligible,
            reasons,
            failed
        };
    },

    /**
     * Calculates a numerical relevance score (0-100+)
     */
    calculateRelevance(user, scheme) {
        let score = 50; // Base score for eligible schemes
        const criteria = scheme.eligibility || {};

        // State Match (High Weight)
        if (scheme.state?.toLowerCase() === user.state?.toLowerCase()) {
            score += WEIGHTS.STATE;
        }

        // Occupation Match (High Weight)
        if (user.occupation && criteria.occupations?.includes(user.occupation)) {
            score += WEIGHTS.OCCUPATION;
        }

        // Income Bracket (Medium Weight)
        // If user income is much lower than max, they are more relevant
        if (criteria.maxIncome) {
            const margin = (criteria.maxIncome - user.income) / criteria.maxIncome;
            score += (margin * WEIGHTS.INCOME);
        }

        // Special Markers (High Weight)
        if (user.hasDisability && criteria.forDisability) score += WEIGHTS.SPECIAL;
        if (user.isStudent && criteria.forStudents) score += WEIGHTS.SPECIAL;
        if (user.isFarmer && criteria.forFarmers) score += WEIGHTS.SPECIAL;

        return Math.round(score);
    }
};

export default RecommendationService;
