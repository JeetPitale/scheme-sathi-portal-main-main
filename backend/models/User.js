import mongoose from 'mongoose';

const eligibilityResultSchema = new mongoose.Schema({
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
    schemeName: { type: String },
    score: { type: Number },
    status: { type: String, enum: ['Fully Eligible', 'Partially Eligible', 'Not Eligible'] },
    timestamp: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    mobile: { type: String },
    role: { type: String, default: 'USER', enum: ['USER', 'SUPER_ADMIN', 'CONTENT_ADMIN', 'REVIEW_ADMIN'] },
    status: { type: String, default: 'active', enum: ['active', 'blocked'] },
    language: { type: String, default: 'en' },
    profile: {
        age: { type: Number },
        gender: { type: String },
        state: { type: String },
        category: { type: String },
        income: { type: Number },
        occupation: { type: String },
        isStudent: { type: Boolean, default: false },
        hasDisability: { type: Boolean, default: false }
    },
    eligibilityHistory: [eligibilityResultSchema]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
