const schemes = [
    {
        name: "PM Kisan Samman Nidhi",
        description: "Income support of Rs 6000/- per year for all land holder farmer families.",
        category: "agriculture",
        state: "Central",
        benefitAmount: 6000,
        rules: {
            occupationRequired: ["Farmer"],
            maxIncome: 2000000 // High limit, mostly land-based
        },
        documents: ["Aadhaar", "Land Records", "Bank Passbook"]
    },
    {
        name: "Post Matric Scholarship for SC Students",
        description: "Financial assistance to SC students for post-matriculation education.",
        category: "education",
        state: "Central",
        benefitAmount: 15000,
        rules: {
            requiredCategory: ["SC"],
            maxIncome: 250000,
            studentStatusRequired: true
        },
        documents: ["Caste Certificate", "Income Certificate", "Mark Sheet"]
    },
    {
        name: "Indira Gandhi National Old Age Pension Scheme",
        description: "Monthly pension for BPL persons aged 60 years or above.",
        category: "pensions",
        state: "Central",
        benefitAmount: 500,
        rules: {
            minAge: 60,
            maxIncome: 50000 // BPL proxy
        },
        documents: ["Age Proof", "BPL Card", "Aadhaar"]
    },
    {
        name: "Mahatma Jyotiba Phule Jan Arogya Yojana",
        description: "Health insurance scheme for the poor in Maharashtra.",
        category: "health",
        state: "Maharashtra",
        benefitAmount: 150000,
        rules: {
            stateSpecific: ["Maharashtra"],
            maxIncome: 100000
        },
        documents: ["Ration Card", "Aadhaar", "Domicile Certificate"]
    },
    {
        name: "Ration Card (Priority Households)",
        description: "Subsidized food grains for eligible households.",
        category: "social-welfare",
        state: "Gujarat",
        benefitAmount: 2000, // Monthly savings estimated
        rules: {
            stateSpecific: ["Gujarat"],
            maxIncome: 150000
        },
        documents: ["Income Certificate", "Electricity Bill", "Aadhaar"]
    }
];

export default schemes;
