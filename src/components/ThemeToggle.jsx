import { useThemeStore } from '@/lib/store';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <>
            <button
                onClick={toggleTheme}
                className="theme-toggle-pill"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Light mode' : 'Dark mode'}
            >
                {/* Sky background */}
                <div className={`theme-toggle-sky ${isDark ? 'night' : 'day'}`} />

                {/* Stars (visible in dark) */}
                <div className={`theme-toggle-stars ${isDark ? 'visible' : ''}`}>
                    <span style={{ top: '6px', left: '8px', animationDelay: '0s' }} />
                    <span style={{ top: '14px', left: '16px', animationDelay: '0.4s' }} />
                    <span style={{ top: '5px', left: '22px', animationDelay: '0.8s' }} />
                    <span style={{ top: '18px', left: '6px', animationDelay: '1.2s' }} />
                </div>

                {/* Clouds (visible in light) */}
                <div className={`theme-toggle-clouds ${!isDark ? 'visible' : ''}`}>
                    <span className="cloud c1" />
                    <span className="cloud c2" />
                </div>

                {/* Knob with sun/moon */}
                <div className={`theme-toggle-knob ${isDark ? 'dark' : ''}`}>
                    {/* Sun rays */}
                    <div className={`theme-toggle-rays ${!isDark ? 'visible' : ''}`}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <span key={i} style={{ transform: `rotate(${i * 45}deg)` }} />
                        ))}
                    </div>
                    {/* Moon craters */}
                    <div className={`theme-toggle-craters ${isDark ? 'visible' : ''}`}>
                        <span className="crater c1" />
                        <span className="crater c2" />
                        <span className="crater c3" />
                    </div>
                </div>
            </button>

            <style>{`
        .theme-toggle-pill {
          position: relative;
          width: 52px;
          height: 28px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
          transition: box-shadow 0.3s ease;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);
        }

        .theme-toggle-pill:hover {
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.15),
                      0 0 0 2px hsl(30 100% 50% / 0.25);
        }

        .theme-toggle-pill:focus-visible {
          outline: 2px solid hsl(30 100% 50%);
          outline-offset: 2px;
        }

        /* ── Sky ── */
        .theme-toggle-sky {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          transition: background 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-toggle-sky.day {
          background: linear-gradient(135deg, #87CEEB 0%, #4BA3E3 50%, #60B5F0 100%);
        }

        .theme-toggle-sky.night {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a1f3a 100%);
        }

        /* ── Stars ── */
        .theme-toggle-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .theme-toggle-stars span {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #fff;
          opacity: 0;
          transition: opacity 0.4s ease 0.2s;
          animation: twinkle 2s ease-in-out infinite;
        }

        .theme-toggle-stars.visible span {
          opacity: 0.9;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.4); }
        }

        /* ── Clouds ── */
        .theme-toggle-clouds {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .theme-toggle-clouds .cloud {
          position: absolute;
          background: rgba(255,255,255,0.65);
          border-radius: 9999px;
          opacity: 0;
          transition: opacity 0.4s ease 0.15s, transform 0.5s ease;
        }

        .theme-toggle-clouds.visible .cloud {
          opacity: 1;
        }

        .cloud.c1 {
          width: 14px;
          height: 5px;
          top: 7px;
          right: 6px;
        }

        .cloud.c2 {
          width: 10px;
          height: 4px;
          top: 17px;
          right: 12px;
        }

        /* ── Knob ── */
        .theme-toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(145deg, #FFD700, #FFA500);
          box-shadow: 0 0 8px rgba(255, 165, 0, 0.4),
                      inset 0 -1px 2px rgba(0,0,0,0.1);
          transition: transform 0.45s cubic-bezier(0.68, -0.3, 0.32, 1.3),
                      background 0.4s ease,
                      box-shadow 0.4s ease;
          z-index: 2;
        }

        .theme-toggle-knob.dark {
          transform: translateX(24px);
          background: linear-gradient(145deg, #e8e8e8, #d4d4d4);
          box-shadow: 0 0 10px rgba(200, 200, 220, 0.3),
                      inset 0 -1px 2px rgba(0,0,0,0.08);
        }

        /* ── Sun rays ── */
        .theme-toggle-rays {
          position: absolute;
          inset: -3px;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.5s ease;
          transform: rotate(0deg);
        }

        .theme-toggle-rays.visible {
          opacity: 1;
          animation: raysSpin 10s linear infinite;
        }

        .theme-toggle-rays span {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 4px;
          margin-left: -1px;
          margin-top: -14px;
          background: rgba(255, 200, 50, 0.7);
          border-radius: 2px;
          transform-origin: 1px 14px;
        }

        @keyframes raysSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Moon craters ── */
        .theme-toggle-craters {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s ease 0.2s;
        }

        .theme-toggle-craters.visible {
          opacity: 1;
        }

        .crater {
          position: absolute;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
        }

        .crater.c1 { width: 5px; height: 5px; top: 5px; left: 10px; }
        .crater.c2 { width: 4px; height: 4px; top: 12px; left: 5px; }
        .crater.c3 { width: 3px; height: 3px; top: 8px; left: 14px; }
      `}</style>
        </>
    );
};

export default ThemeToggle;
