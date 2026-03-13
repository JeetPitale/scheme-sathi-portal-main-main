import RuleEngine from '../utils/RuleEngine.js';

const mockScheme = {
    _id: "scheme1",
    name: "PM Kisan",
    rules: {
        minAge: 18,
        maxIncome: 300000,
        occupationRequired: ["Farmer"],
        stateSpecific: ["Maharashtra", "Gujarat"]
    }
};

const profiles = [
    {
        name: "Eligible User",
        age: 30,
        income: 150000,
        occupation: "Farmer",
        state: "Maharashtra"
    },
    {
        name: "Ineligible - Age",
        age: 16,
        income: 150000,
        occupation: "Farmer",
        state: "Maharashtra"
    },
    {
        name: "Ineligible - Income",
        age: 30,
        income: 400000,
        occupation: "Farmer",
        state: "Maharashtra"
    },
    {
        name: "Ineligible - Occupation",
        age: 30,
        income: 150000,
        occupation: "Student",
        state: "Maharashtra"
    },
    {
        name: "Ineligible - State",
        age: 30,
        income: 150000,
        occupation: "Farmer",
        state: "Karnataka"
    },
    {
        name: "Partially Eligible - Missing Income",
        age: 30,
        occupation: "Farmer",
        state: "Maharashtra"
    }
];

console.log("--- Rule Engine Test Results ---");
profiles.forEach(profile => {
    const result = RuleEngine.evaluate(profile, mockScheme);
    console.log(`User: ${profile.name} | Status: ${result.status} | Score: ${result.score}`);
    console.log(`Matched: ${result.matched} | Failed: ${result.failed} | Missing: ${result.missing}`);
    console.log("--------------------------------");
});
