import { useEffect, useState } from 'react';
// Proper Indian number formatting (lakhs, crores)
const formatIndianNumber = (num) => {
    const numStr = num.toString();
    const lastThree = numStr.slice(-3);
    const otherNumbers = numStr.slice(0, -3);
    if (otherNumbers !== '') {
        return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return lastThree;
};
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime;
        let animationFrame;
        const animate = (timestamp) => {
            if (!startTime)
                startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);
    return (<span className="tabular-nums">
        {formatIndianNumber(count)}{suffix}
    </span>);
};
const stats = [
    { label: 'Registered Users', value: 12478930, suffix: '+' },
    { label: 'Schemes Available', value: 400, suffix: '+' },
    { label: 'Applications Processed', value: 8924560, suffix: '+' },
    { label: 'States Covered', value: 28, suffix: '' },
];
const LiveCounter = () => {
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (<div key={stat.label} className="text-center p-4 md:p-5 rounded-2xl bg-card border border-border/50 shadow-sm min-w-0">
            <div className="text-xl md:text-2xl font-bold text-primary mb-1 whitespace-nowrap">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">
                {stat.label}
            </div>
        </div>))}
    </div>);
};
export default LiveCounter;
