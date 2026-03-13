import React from 'react';

const PageLoader = () => {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20 duration-1000" />

                {/* Inner spinning ring */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg" />

                {/* Center dot */}
                <div className="absolute h-4 w-4 rounded-full bg-primary" />
            </div>

            {/* Branding support text */}
            <div className="mt-8 text-center animate-pulse">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Scheme Saarthi</h2>
                <p className="mt-1 text-sm text-muted-foreground font-medium">Empowering Citizens, Enabling Schemes</p>
            </div>
        </div>
    );
};

export default PageLoader;
