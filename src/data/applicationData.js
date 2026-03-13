export const mockApplications = [
    {
        id: 'APP-2024-001',
        serviceId: 'pm-kisan',
        serviceName: 'PM Kisan Samman Nidhi',
        status: 'in-review',
        dateApplied: '2024-02-01T10:00:00.000Z',
        lastUpdated: '2024-02-05T14:30:00.000Z',
        category: 'agriculture',
        formData: { fullName: 'Rahul Sharma', mobile: '9876543210' },
        timeline: [
            { label: 'Application Submitted', date: '2024-02-01', status: 'completed' },
            { label: 'Document Verification', date: '2024-02-03', status: 'completed' },
            { label: 'Department Review', date: '2024-02-05', status: 'current' },
            { label: 'Final Decision', date: null, status: 'pending' }
        ]
    },
    {
        id: 'APP-2024-002',
        serviceId: 'ayushman-bharat',
        serviceName: 'Ayushman Bharat Yojana',
        status: 'approved',
        dateApplied: '2024-01-15T09:30:00.000Z',
        lastUpdated: '2024-01-20T11:00:00.000Z',
        category: 'health',
        formData: { fullName: 'Rahul Sharma', mobile: '9876543210' },
        timeline: [
            { label: 'Application Submitted', date: '2024-01-15', status: 'completed' },
            { label: 'Document Verification', date: '2024-01-18', status: 'completed' },
            { label: 'Department Review', date: '2024-01-20', status: 'completed' },
            { label: 'Approved', date: '2024-01-20', status: 'completed' }
        ]
    },
    {
        id: 'APP-2023-089',
        serviceId: 'scholarship',
        serviceName: 'Pre-Matric Scholarship',
        status: 'rejected',
        dateApplied: '2023-11-10T15:45:00.000Z',
        lastUpdated: '2023-11-25T09:15:00.000Z',
        category: 'education',
        formData: { fullName: 'Rahul Sharma', mobile: '9876543210' },
        timeline: [
            { label: 'Application Submitted', date: '2023-11-10', status: 'completed' },
            { label: 'Document Verification', date: '2023-11-15', status: 'completed' },
            { label: 'Rejected', date: '2023-11-25', status: 'error' }
        ]
    },
    // New Data for Analytics
    {
        id: 'APP-2024-003',
        serviceId: 'ration-card',
        serviceName: 'Ration Card Application',
        status: 'submitted',
        dateApplied: '2024-03-05T10:00:00.000Z',
        lastUpdated: '2024-03-05T10:00:00.000Z',
        category: 'social-welfare',
        formData: { fullName: 'Rahul Sharma' },
        timeline: [{ label: 'Application Submitted', date: '2024-03-05', status: 'completed' }]
    },
    {
        id: 'APP-2024-004',
        serviceId: 'pm-awas',
        serviceName: 'PM Awas Yojana',
        status: 'approved',
        dateApplied: '2023-12-12T09:30:00.000Z',
        lastUpdated: '2024-01-10T11:00:00.000Z',
        category: 'social-welfare',
        formData: { fullName: 'Rahul Sharma' },
        timeline: [
            { label: 'Application Submitted', date: '2023-12-12', status: 'completed' },
            { label: 'Approved', date: '2024-01-10', status: 'completed' }
        ]
    },
    {
        id: 'APP-2024-005',
        serviceId: 'driving-license',
        serviceName: 'Driving License',
        status: 'approved',
        dateApplied: '2023-10-15T09:30:00.000Z',
        lastUpdated: '2023-11-01T11:00:00.000Z',
        category: 'transport',
        formData: { fullName: 'Rahul Sharma' },
        timeline: [
            { label: 'Application Submitted', date: '2023-10-15', status: 'completed' },
            { label: 'Approved', date: '2023-11-01', status: 'completed' }
        ]
    },
    {
        id: 'APP-2024-006',
        serviceId: 'soil-health',
        serviceName: 'Soil Health Card',
        status: 'completed', // Treated as approved
        dateApplied: '2024-02-20T09:30:00.000Z',
        lastUpdated: '2024-02-28T11:00:00.000Z',
        category: 'agriculture',
        formData: { fullName: 'Rahul Sharma' },
        timeline: [
            { label: 'Application Submitted', date: '2024-02-20', status: 'completed' },
            { label: 'Report Generated', date: '2024-02-28', status: 'completed' }
        ]
    }
];

export const getStatusSteps = (status) => {
    const steps = [
        { label: 'Application Submitted', key: 'submitted' },
        { label: 'Under Review', key: 'in-review' },
        { label: 'Department Approval', key: 'approved' }
    ];
    return steps;
};
