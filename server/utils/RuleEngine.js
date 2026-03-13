class RuleEngine {
    static evaluate(userProfile, scheme) {
        const rules = scheme.rules;
        const result = {
            schemeId: scheme._id,
            name: scheme.name,
            score: 0,
            status: 'Not Eligible',
            matched: [],
            failed: [],
            missing: []
        };

        if (!rules) {
            result.status = 'Fully Eligible';
            result.score = 100;
            result.explanation = "No specific rules defined for this scheme.";
            return result;
        }

        let criticalFail = false;

        // 1. State Check
        if (rules.stateSpecific && rules.stateSpecific.length > 0) {
            if (!userProfile.state) {
                result.missing.push('state');
            } else if (rules.stateSpecific.includes(userProfile.state) || rules.stateSpecific.includes('Central')) {
                result.matched.push('state');
            } else {
                result.failed.push('state');
                criticalFail = true;
            }
        }

        // 2. Age Check
        if (rules.minAge || rules.maxAge) {
            if (!userProfile.age) {
                result.missing.push('age');
            } else {
                const minFn = rules.minAge ? userProfile.age >= rules.minAge : true;
                const maxFn = rules.maxAge ? userProfile.age <= rules.maxAge : true;

                if (minFn && maxFn) {
                    result.matched.push('age');
                } else {
                    result.failed.push('age');
                    criticalFail = true;
                }
            }
        }

        // 3. Income Check
        if (rules.maxIncome) {
            if (!userProfile.income) {
                // If income is required but missing, it's often critical check.
                // Assuming 'missing' for now.
                result.missing.push('income');
            } else if (userProfile.income <= rules.maxIncome) {
                result.matched.push('income');
            } else {
                result.failed.push('income');
                criticalFail = true;
            }
        }

        // 4. Category Check
        if (rules.requiredCategory && rules.requiredCategory.length > 0) {
            if (!userProfile.category) {
                result.missing.push('category');
            } else if (rules.requiredCategory.includes(userProfile.category)) {
                result.matched.push('category');
            } else {
                result.failed.push('category');
                criticalFail = true;
            }
        }

        // 5. Occupation Check
        if (rules.occupationRequired && rules.occupationRequired.length > 0) {
            if (!userProfile.occupation) {
                result.missing.push('occupation');
            } else if (rules.occupationRequired.includes(userProfile.occupation)) {
                result.matched.push('occupation');
            } else {
                result.failed.push('occupation');
                criticalFail = true;
            }
        }

        // Status Determination
        if (criticalFail) {
            result.status = 'Not Eligible';
            result.score = 0;
        } else if (result.missing.length > 0) {
            result.status = 'Partially Eligible';
            result.score = 50; // Arbitrary score for incomplete data
        } else {
            result.status = 'Fully Eligible';
            result.score = 100;
        }

        return result;
    }
}

export default RuleEngine;
