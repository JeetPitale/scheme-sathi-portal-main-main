import { useState } from 'react';
import EligibilityWizard from '../components/EligibilityWizard';
import Layout from '../components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { useAuthStore } from '@/lib/store';

const Eligibility = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuthStore();

    const handleCheck = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Validate & Transform Data
            const payload = {
                ...userData,
                age: Number(userData.age),
                income: Number(userData.income),
                userId: user?.id || null, // Inject user ID if available
            };

            if (isNaN(payload.age) || isNaN(payload.income)) {
                throw new Error("Invalid Age or Income. Please enter valid numbers.");
            }

            console.log("Checking eligibility for:", payload);

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
            let data;

            try {
                // 2. Attempt API Call
                const response = await fetch(`${apiBaseUrl}/api/eligibility/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                data = await response.json();

            } catch (apiErr) {
                // 3. Fallback: Local Logic if API fails (e.g. localhost:5000 offline)
                console.warn("API failed, using local fallback logic:", apiErr);
                data = runLocalEligibilityCheck(payload);
            }

            if (!data || !data.recommendations) {
                throw new Error("No recommendation data received");
            }

            setResults(data.recommendations);
        } catch (err) {
            console.error("Eligibility Check Failed:", err);
            setError(err.message || "Failed to check eligibility. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- Local Fallback Logic (Mirrors Backend) ---
    const runLocalEligibilityCheck = (user) => {
        const schemes = [
            {
                id: 'pm-kisan',
                name: 'PM Kisan Samman Nidhi',
                conditions: (u) => u.occupation === 'Farmer' && u.income < 200000
            },
            {
                id: 'scholarship-sc-st',
                name: 'Post Matric Scholarship for SC/ST',
                conditions: (u) => u.isStudent && (u.category === 'SC' || u.category === 'ST') && u.income < 250000
            },
            {
                id: 'mudra-loan',
                name: 'Pradhan Mantri Mudra Yojana',
                conditions: (u) => u.occupation === 'Business' || u.occupation === 'Unemployed'
            },
            {
                id: 'ayushman-bharat',
                name: 'Ayushman Bharat Yojana',
                conditions: (u) => u.income < 500000
            }
        ];

        const recommendations = schemes.map(scheme => {
            const isEligible = scheme.conditions(user);
            return {
                schemeId: scheme.id,
                name: scheme.name,
                score: isEligible ? 100 : 0,
                status: isEligible ? 'Fully Eligible' : 'Not Eligible',
                matched: isEligible ? ['Criteria Met'] : [],
                failed: isEligible ? [] : ['Criteria Not Met'],
                missing: []
            };
        }).filter(r => r.score > 0); // Only return eligible/partial

        return { recommendations: recommendations.length > 0 ? recommendations : [] };
    };

    const reset = () => {
        setResults(null);
        setError(null);
    };

    return (
        <Layout>
            <div className="container py-10">
                <h1 className="text-3xl font-bold text-center mb-8">Smart Scheme Eligibility</h1>

                {loading && <p className="text-center">Analyzing your profile...</p>}

                {error && (
                    <div className="text-center text-red-500 mb-4">
                        <p>Error: {error}</p>
                        <Button onClick={reset} variant="outline" className="mt-2">Try Again</Button>
                    </div>
                )}

                {!results && !loading && !error && (
                    <EligibilityWizard onComplete={handleCheck} />
                )}

                {results && (
                    <div className="max-w-4xl mx-auto">
                        <Button onClick={reset} variant="ghost" className="mb-4">← Check for another person</Button>

                        <h2 className="text-2xl font-semibold mb-4">Your Recommendations</h2>

                        <div className="grid gap-4">
                            {results.map((item) => (
                                <Card key={item.schemeId} className={item.score === 100 ? "border-green-500" : "border-gray-200"}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{item.name}</CardTitle>
                                                <CardDescription>
                                                    Status: <span className={
                                                        item.status === 'Fully Eligible' ? 'text-green-600 font-bold' :
                                                            item.status === 'Partially Eligible' ? 'text-yellow-600 font-bold' : 'text-red-500 font-bold'
                                                    }>{item.status} ({item.score}%)</span>
                                                </CardDescription>
                                            </div>
                                            {item.status === 'Fully Eligible' ? <CheckCircle className="text-green-500" /> :
                                                item.status === 'Partially Eligible' ? <AlertCircle className="text-yellow-500" /> : <XCircle className="text-red-400" />}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {item.matched.length > 0 && (
                                            <p className="text-sm text-green-700">✓ Matched: {item.matched.join(', ')}</p>
                                        )}
                                        {item.failed.length > 0 && (
                                            <p className="text-sm text-red-600">✗ Failed: {item.failed.join(', ')}</p>
                                        )}
                                        {item.missing.length > 0 && (
                                            <p className="text-sm text-yellow-600">? Missing Info: {item.missing.join(', ')}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Eligibility;
