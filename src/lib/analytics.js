import { getServiceById } from './services';

export const calculateMetrics = (applications = []) => {
    const total = applications.length;
    const active = applications.filter(app => ['submitted', 'in-review', 'verification'].includes(app.status)).length;
    const approved = applications.filter(app => ['approved', 'completed'].includes(app.status)).length;

    // Calculate total benefits
    const totalBenefits = applications.reduce((sum, app) => {
        if (['approved', 'completed'].includes(app.status)) {
            const service = getServiceById(app.serviceId);
            return sum + (service?.estimatedBenefitAmount || 0);
        }
        return sum;
    }, 0);

    return { total, active, approved, totalBenefits };
};

export const getMonthlyActivity = (applications = []) => {
    const monthlyData = {};
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']; // Last 6 months

    // Initialize
    months.forEach(m => monthlyData[m] = 0);

    applications.forEach(app => {
        const date = new Date(app.dateApplied);
        const month = date.toLocaleString('default', { month: 'short' });
        if (monthlyData.hasOwnProperty(month)) {
            monthlyData[month]++;
        }
    });

    return Object.keys(monthlyData).map(month => ({
        name: month,
        count: monthlyData[month]
    }));
};

export const getStatusDistribution = (applications = []) => {
    const distribution = {
        'Submitted': 0,
        'In Review': 0,
        'Approved': 0,
        'Rejected': 0
    };

    applications.forEach(app => {
        if (app.status === 'submitted') distribution['Submitted']++;
        else if (['in-review', 'verification'].includes(app.status)) distribution['In Review']++;
        else if (['approved', 'completed'].includes(app.status)) distribution['Approved']++;
        else if (app.status === 'rejected') distribution['Rejected']++;
    });

    return Object.keys(distribution).map(status => ({
        name: status,
        value: distribution[status]
    })).filter(item => item.value > 0);
};
