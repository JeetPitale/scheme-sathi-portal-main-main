import express from 'express';
import { checkEligibility, getSchemes, getSchemeById } from '../controllers/eligibilityController.js';

const router = express.Router();

router.post('/check', checkEligibility);
router.get('/', getSchemes);
router.get('/:id', getSchemeById);

export default router;
