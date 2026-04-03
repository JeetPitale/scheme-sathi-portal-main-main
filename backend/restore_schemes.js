
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Scheme from './models/Scheme.js';

dotenv.config();

async function restore() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('Reading schemes from src/data/schemes.json...');
        const rawData = fs.readFileSync('../src/data/schemes.json', 'utf8');
        const originalSchemes = JSON.parse(rawData);
        
        console.log(`Found ${originalSchemes.length} schemes in file.`);
        
        console.log('Cleaning up existing schemes...');
        await Scheme.deleteMany({});
        
        const formattedSchemes = originalSchemes.map(s => {
            // Combine benefits into a description string
            const benefitsRaw = s.benefits || {};
            const desc = `${s.application_process_summary || ''}\n\nBenefits: ${benefitsRaw.financial_assistance || ''} | ${benefitsRaw.non_financial_support || ''}`;
            
            // Normalize category for frontend matching
            let cat = s.category || 'general';
            cat = cat.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
            
            // Map state
            let state = s.state || 'central';
            if (state.toLowerCase() === 'all india') state = 'central';
            else state = state.toLowerCase().replace(/\s+/g, '');

            // Parse rules
            const incomeMatch = (s.income_limit || '').match(/₹([\d,]+)/);
            const maxIncome = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, '')) : 800000;

            const ageMatch = (s.age_criteria || '').match(/(\d+)/);
            const minAge = ageMatch ? parseInt(ageMatch[1]) : 18;

            return {
                name: s.scheme_name,
                description: s.application_process_summary || s.benefits?.financial_assistance || 'Government welfare scheme.',
                category: cat,
                state: state,
                benefitAmount: 0, // Placeholder
                documents: s.required_documents || [],
                rules: {
                    minAge: minAge,
                    maxAge: 100,
                    maxIncome: maxIncome,
                    requiredCategory: [],
                    occupationRequired: [],
                    stateSpecific: [],
                    disabilityRequired: (s.required_documents || []).includes('Disability Certificate'),
                    studentStatusRequired: (s.age_criteria || '').toLowerCase().includes('student')
                }
            };
        });
        
        console.log('Importing formatted schemes...');
        await Scheme.insertMany(formattedSchemes);
        
        console.log('SUCCESS! All schemes restored.');
        
    } catch (err) {
        console.error('RESTORE ERROR: ' + err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

restore();
