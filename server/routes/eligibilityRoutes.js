import express from 'express';
import { checkEligibility, getSchemes } from '../controllers/eligibilityController.js';

const router = express.Router();

router.post('/check', checkEligibility);
router.get('/', getSchemes);

export default router;
