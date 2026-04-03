import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

// Get all applications for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const applications = await Application.find({ user_id: req.params.userId }).sort({ submitted_at: -1 });
        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new application
router.post('/', async (req, res) => {
    try {
        const { user_id, scheme_id, scheme_name, form_data } = req.body;
        
        // Generate a custom ID matching the Firebase logic
        const year = new Date().getFullYear();
        const randomStr = Math.floor(10000 + Math.random() * 90000);
        const application_id = `SSA-${year}-${randomStr}`;

        const newApp = new Application({
            application_id,
            user_id,
            scheme_id,
            scheme_name,
            form_data
        });

        await newApp.save();
        res.status(201).json({ success: true, data: newApp });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all applications (Admin)
router.get('/', async (req, res) => {
    try {
        const applications = await Application.find().sort({ submitted_at: -1 });
        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update application status (Admin)
router.patch('/:applicationId/status', async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const app = await Application.findOneAndUpdate(
            { application_id: req.params.applicationId },
            { status, remarks },
            { new: true }
        );
        
        if (!app) return res.status(404).json({ success: false, error: "Application not found" });
        res.json({ success: true, data: app });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
