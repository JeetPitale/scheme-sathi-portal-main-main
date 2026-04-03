import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    application_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    scheme_id: { type: String, required: true },
    scheme_name: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    form_data: { type: mongoose.Schema.Types.Mixed, default: {} },
    remarks: { type: String, default: null },
    attachments: [String],
    submitted_at: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexing to fetch user applications quickly, acting like the Firebase composite index
applicationSchema.index({ user_id: 1, submitted_at: -1 });

export default mongoose.model('Application', applicationSchema);
