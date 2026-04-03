import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({
    minAge: { type: Number },
    maxAge: { type: Number },
    maxIncome: { type: Number },
    requiredCategory: [{ type: String }], // e.g., ['SC', 'ST']
    occupationRequired: [{ type: String }], // e.g., ['Farmer', 'Student']
    stateSpecific: [{ type: String }], // e.g., ['Maharashtra', 'Gujarat']
    disabilityRequired: { type: Boolean, default: false },
    studentStatusRequired: { type: Boolean, default: false }
}, { _id: false });

const schemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'agriculture', 'education'
    state: { type: String, required: true }, // 'central' or state name
    benefitAmount: { type: Number },
    rules: { type: ruleSchema, required: true },
    documents: [{ type: String }]
}, { timestamps: true });

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
