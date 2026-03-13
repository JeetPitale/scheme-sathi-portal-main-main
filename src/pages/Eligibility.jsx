import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EligibilityWizard from '../components/EligibilityWizard';
import Layout from '../components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

import { useAuthStore, useApplicationStore } from '@/lib/store';
import { useSchemeStore } from '@/stores/schemeStore';
import RecommendationService from '@/services/RecommendationService';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const Eligibility = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { loadSchemes } = useSchemeStore();
    const { loadApplications } = useApplicationStore();

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
            const appliedIds = currentApps.map(a => a.serviceId || a.schemeId);

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

    const reset = () => {
        setResults(null);
        setError(null);
    };

    return (
        <Layout>
            <div className="container py-10">
                <h1 className="text-3xl font-bold text-center mb-8">Smart Scheme Eligibility</h1>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                        <p className="text-lg font-medium animate-pulse">Analyzing your profile for the best matches...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 mb-4 max-w-md mx-auto p-6 bg-red-50 rounded-xl border border-red-100 shadow-sm">
                        <AlertCircle className="h-10 w-10 mx-auto mb-3" />
                        <h3 className="text-lg font-bold mb-1">Check Failed</h3>
                        <p className="text-sm opacity-90 mb-4">{error}</p>
                        <Button onClick={reset} variant="destructive" className="w-full">Try Again</Button>
                    </div>
                )}

                {!results && !loading && !error && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <EligibilityWizard onComplete={handleCheck} />
                    </div>
                )}

                {results && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm">
                            <Button onClick={reset} variant="outline" className="group">
                                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                                Try different profile
                            </Button>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Found {results.length} personalized recommendations
                                </span>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                    AI Powered
                                </Badge>
                            </div>
                        </div>

                        {results.length === 0 ? (
                            <Card className="bg-slate-50/50 border-dashed border-2 py-16 text-center shadow-none">
                                <CardContent>
                                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-700">No exact matches found</h3>
                                    <p className="text-slate-500 mt-3 max-w-sm mx-auto">
                                        Your profile details didn't exactly match current scheme criteria. Try relaxing some conditions or browse all schemes.
                                    </p>
                                    <Button onClick={() => navigate('/services')} variant="link" className="mt-4">
                                        Browse all available schemes
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {results.map((scheme, index) => (
                                    <Card key={scheme.id} 
                                          className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 group animate-in slide-in-from-bottom-4`}
                                          style={{ animationDelay: `${index * 100}ms` }}>
                                        <CardHeader className="pb-3 px-6 bg-gradient-to-r from-green-50/30 to-transparent">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                                                            {scheme.name}
                                                        </CardTitle>
                                                        <Badge className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                                            {scheme.relevanceScore}% Match
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="text-base line-clamp-2 mt-2 leading-relaxed">
                                                        {scheme.description}
                                                    </CardDescription>
                                                </div>
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="text-green-600 h-6 w-6" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-6 pt-2">
                                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">?</span>
                                                    Why this is recommended for you:
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {scheme.recommendationData?.reasons?.map((reason, idx) => (
                                                        <div key={idx} className="flex items-center text-sm text-slate-600 bg-white/60 p-2 rounded-lg border border-slate-50 shadow-sm">
                                                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 shrink-0" />
                                                            {reason}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="text-sm">
                                                    <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] block mb-1">Primary Benefit</span>
                                                    <p className="text-slate-700 font-medium line-clamp-1 italic">
                                                        {scheme.benefits || "Consult scheme guidelines for full list of benefits"}
                                                    </p>
                                                </div>
                                                <Button size="lg" 
                                                        className="px-10 h-12 shadow-md hover:shadow-lg transition-all rounded-full font-bold"
                                                        onClick={() => navigate(`/schemes/${scheme.slug}`)}>
                                                    Apply for this Scheme →
                                                </Button>
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
