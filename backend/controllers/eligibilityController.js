import Scheme from '../models/Scheme.js';
import RuleEngine from '../utils/RuleEngine.js';
import mongoose from 'mongoose';

// @desc    Check eligibility for schemes
// @route   POST /api/eligibility/check
// @access  Public
export const checkEligibility = async (req, res) => {
    try {
        const userProfile = req.body;

        // Basic validation could go here or middleware
        if (!userProfile) {
            return res.status(400).json({ message: "User profile data is required" });
        }

        const schemes = await Scheme.find({});

        // Evaluate all schemes
        const results = schemes.map(scheme => {
            return RuleEngine.evaluate(userProfile, scheme);
        });

        // Sort by Score (Desc)
        results.sort((a, b) => b.score - a.score);

        res.json({
            count: results.length,
            recommendations: results
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all schemes
// @route   GET /api/schemes
// @access  Public
export const getSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find({});
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

// @desc    Get scheme by ID or slug
// @route   GET /api/schemes/:id
// @access  Public
export const getSchemeById = async (req, res) => {
    try {
        const { id } = req.params;
        let scheme;
        
        // Try to find by ObjectID first, then by slug
        if (mongoose.Types.ObjectId.isValid(id)) {
            scheme = await Scheme.findById(id);
        }
        
        if (!scheme) {
            const query = { slug: id };
            scheme = await Scheme.findOne(query);
        }

        if (!scheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }
        
        res.json(scheme);
    } catch (error) {
        console.error('SERVER ERROR IN SCHEME FETCH:', error);
        res.status(500).json({ message: "Server Error" });
    }
}
