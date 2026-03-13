import { useState } from 'react';
import EligibilityWizard from '../components/EligibilityWizard';
import Layout from '../components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { useAuthStore, useApplicationStore } from '@/lib/store';
import { useSchemeStore } from '@/stores/schemeStore';
import RecommendationService from '@/services/RecommendationService';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const Eligibility = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuthStore();
    const { schemes, loadSchemes } = useSchemeStore();
    const { applications, loadApplications } = useApplicationStore();

    const handleCheck = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Ensure data is loaded
            await Promise.all([
                loadSchemes(),
                loadApplications()
            ]);

            const currentSchemes = useSchemeStore.getState().schemes;
            const currentApps = useApplicationStore.getState().applications;
            const appliedIds = currentApps.map(a => a.schemeId);

            // 2. Run the Intelligent Recommendation Engine
            const recommendations = RecommendationService.recommend(
                userData, 
                currentSchemes, 
                appliedIds
            );

            if (recommendations.length === 0) {
                toast.info("No matching schemes found for your profile.");
            } else {
                toast.success(`Found ${recommendations.length} matching schemes!`);
            }

            setResults(recommendations);
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
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex justify-between items-center">
                            <Button onClick={reset} variant="outline">← Try different profile</Button>
                            <span className="text-sm font-medium text-muted-foreground">
                                Based on {results.length} matched criteria
                            </span>
                        </div>

                        {results.length === 0 ? (
                            <Card className="bg-slate-50 border-dashed border-2 py-12 text-center">
                                <CardContent>
                                    <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-medium">No matches found</h3>
                                    <p className="text-muted-foreground mt-2">Try adjusting your filters or expanding your search.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {results.map((scheme) => (
                                    <Card key={scheme.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                                        <CardHeader className="pb-3 px-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-xl font-bold">{scheme.name}</CardTitle>
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                            {scheme.relevanceScore}% Match
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="text-base line-clamp-2">
                                                        {scheme.description}
                                                    </CardDescription>
                                                </div>
                                                <CheckCircle className="text-green-500 h-6 w-6 shrink-0" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-6">
                                            <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                    Recommended because:
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {scheme.recommendationData.reasons.map((reason, idx) => (
                                                        <div key={idx} className="flex items-center text-sm text-green-700 font-medium">
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            {reason}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    <strong>Benefits:</strong> {scheme.benefits || "Refer to scheme document"}
                                                </div>
                                                <Button size="lg" className="px-8 shadow-md">Apply Now</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Eligibility;
