import { Link, useLocation } from "react-router-dom";
import { Copy } from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";

const Placeholder = () => {
    const location = useLocation();

    // Create a pretty title from the pathname
    const pageName = location.pathname
        .replace('/', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <Layout>
            <div className="container py-16 md:py-24 text-center max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <Copy className="h-8 w-8 text-primary/60" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageName}</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    This page is currently under construction. Check back soon for updates to the {pageName} section.
                </p>
                <Link to="/">
                    <Button size="lg">Return to Home</Button>
                </Link>
            </div>
        </Layout>
    );
};

export default Placeholder;
