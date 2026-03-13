import { useState, useEffect } from 'react';

const IntroLoader = ({ onComplete }) => {
    // Stage 0: S (English) -> Stage 1: સ (Gujarati) -> Stage 2: स (Hindi) -> Stage 3: S (English) -> Finish
    const [stage, setStage] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const characters = [
        { char: 'S', lang: 'en', label: 'English' },
        { char: 'સ', lang: 'gu', label: 'ગુજરાતી' },
        { char: 'स', lang: 'hi', label: 'हिन्दी' },
        { char: 'S', lang: 'en', label: 'Scheme Sarthi' }
    ];

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            setIsVisible(false);
            onComplete();
            return;
        }

        const failsafeTimeout = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
        }, 4500);

        const sequence = async () => {
            await new Promise(r => setTimeout(r, 800));
            setStage(1); // Gujarati

            await new Promise(r => setTimeout(r, 800));
            setStage(2); // Hindi

            await new Promise(r => setTimeout(r, 800));
            setStage(3); // English Final

            await new Promise(r => setTimeout(r, 1000));
            setIsExiting(true);

            await new Promise(r => setTimeout(r, 600));
            setIsVisible(false);
            onComplete();
            clearTimeout(failsafeTimeout);
        };

        sequence();

        return () => clearTimeout(failsafeTimeout);
    }, [onComplete]);

    if (!isVisible) return null;

    const progress = ((stage + 1) / characters.length) * 100;

    return (
        <div
            className={`intro-loader ${isExiting ? 'intro-loader--exit' : ''}`}
            role="status"
            aria-label="Loading Scheme Sathi Portal"
        >
            {/* Animated background particles */}
            <div className="intro-particles">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="intro-particle"
                        style={{
                            '--delay': `${i * 0.4}s`,
                            '--x': `${20 + (i * 12)}%`,
                            '--size': `${60 + (i * 20)}px`,
                        }}
                    />
                ))}
            </div>

            {/* Outer glow ring */}
            <div className="intro-glow-ring" />

            <div className="intro-content">
                {/* Character display */}
                <div className="intro-char-wrapper">
                    <div key={stage} className="intro-char">
                        {characters[stage].char}
                    </div>
                </div>

                {/* Language label */}
                <div key={`label-${stage}`} className="intro-label">
                    {characters[stage].label}
                </div>

                {/* Stage indicator dots */}
                <div className="intro-dots">
                    {characters.map((_, i) => (
                        <div
                            key={i}
                            className={`intro-dot ${i === stage ? 'intro-dot--active' : ''} ${i < stage ? 'intro-dot--done' : ''}`}
                        />
                    ))}
                </div>

                {/* Progress bar */}
                <div className="intro-progress-track">
                    <div
                        className="intro-progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Inline styles – self-contained, no external CSS needed */}
            <style>{`
                .intro-loader {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(145deg, hsl(220 20% 10%) 0%, hsl(220 25% 7%) 50%, hsl(230 20% 12%) 100%);
                    overflow: hidden;
                    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                                transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .intro-loader--exit {
                    opacity: 0;
                    transform: scale(1.05);
                    pointer-events: none;
                }

                /* ── Floating particles ── */
                .intro-particles {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .intro-particle {
                    position: absolute;
                    bottom: -20%;
                    left: var(--x);
                    width: var(--size);
                    height: var(--size);
                    border-radius: 50%;
                    background: radial-gradient(circle, hsl(30 100% 50% / 0.12) 0%, transparent 70%);
                    animation: particleFloat 4s ease-in-out infinite;
                    animation-delay: var(--delay);
                }

                @keyframes particleFloat {
                    0%   { transform: translateY(0) scale(0.8); opacity: 0; }
                    30%  { opacity: 1; }
                    70%  { opacity: 0.6; }
                    100% { transform: translateY(-120vh) scale(1.2); opacity: 0; }
                }

                /* ── Glow ring ── */
                .intro-glow-ring {
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    border: 2px solid hsl(30 100% 50% / 0.08);
                    box-shadow: 0 0 80px 20px hsl(30 100% 50% / 0.06),
                                inset 0 0 60px 10px hsl(30 100% 50% / 0.04);
                    animation: ringPulse 3s ease-in-out infinite;
                }

                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50%      { transform: scale(1.15); opacity: 0.8; }
                }

                /* ── Content ── */
                .intro-content {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 2;
                }

                /* ── Character ── */
                .intro-char-wrapper {
                    width: 140px;
                    height: 140px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: linear-gradient(135deg, hsl(30 100% 50% / 0.15) 0%, hsl(30 100% 50% / 0.05) 100%);
                    box-shadow: 0 0 40px hsl(30 100% 50% / 0.1);
                    margin-bottom: 1.5rem;
                }

                .intro-char {
                    font-size: 5rem;
                    font-weight: 800;
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(160deg, hsl(30 100% 60%) 0%, hsl(35 100% 50%) 50%, hsl(25 100% 45%) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    filter: drop-shadow(0 0 20px hsl(30 100% 50% / 0.3));
                    animation: charIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }

                @keyframes charIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.5) rotateY(45deg);
                        filter: drop-shadow(0 0 0px transparent) blur(4px);
                    }
                    60% {
                        transform: scale(1.08) rotateY(-5deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotateY(0deg);
                        filter: drop-shadow(0 0 20px hsl(30 100% 50% / 0.3)) blur(0px);
                    }
                }

                /* ── Label ── */
                .intro-label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    font-family: 'Poppins', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    color: hsl(30 100% 70%);
                    margin-bottom: 1.5rem;
                    animation: labelIn 0.4s ease-out 0.15s both;
                }

                @keyframes labelIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Dots ── */
                .intro-dots {
                    display: flex;
                    gap: 0.625rem;
                    margin-bottom: 1.25rem;
                }

                .intro-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: hsl(0 0% 100% / 0.15);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .intro-dot--active {
                    background: hsl(30 100% 55%);
                    box-shadow: 0 0 12px hsl(30 100% 50% / 0.6);
                    transform: scale(1.3);
                }

                .intro-dot--done {
                    background: hsl(30 100% 50% / 0.5);
                }

                /* ── Progress bar ── */
                .intro-progress-track {
                    width: 140px;
                    height: 3px;
                    border-radius: 4px;
                    background: hsl(0 0% 100% / 0.08);
                    overflow: hidden;
                }

                .intro-progress-bar {
                    height: 100%;
                    border-radius: 4px;
                    background: linear-gradient(90deg, hsl(30 100% 55%), hsl(35 100% 50%));
                    box-shadow: 0 0 8px hsl(30 100% 50% / 0.4);
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @media (min-width: 768px) {
                    .intro-char-wrapper {
                        width: 180px;
                        height: 180px;
                    }
                    .intro-char {
                        font-size: 6.5rem;
                    }
                    .intro-glow-ring {
                        width: 400px;
                        height: 400px;
                    }
                    .intro-progress-track {
                        width: 180px;
                    }
                }
            `}</style>
        </div>
    );
};

export default IntroLoader;
