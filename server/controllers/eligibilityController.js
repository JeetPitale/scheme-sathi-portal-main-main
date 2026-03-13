import Scheme from '../models/Scheme.js';
import RuleEngine from '../utils/RuleEngine.js';

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
