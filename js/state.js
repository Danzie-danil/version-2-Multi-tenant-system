// ── Shared Application State ──────────────────────────────────────────────
window.state = {
    currentUser: null,
    role: null,       // 'owner' | 'branch'
    branchId: null,

    branches: [
        {
            id: 'downtown',
            name: 'Downtown Branch',
            location: 'City Center',
            manager: 'John Smith',
            status: 'active',
            pin: '000000',
            todaySales: 12500,
            target: 15000
        },
        {
            id: 'mall',
            name: 'Shopping Mall Branch',
            location: 'Grand Mall',
            manager: 'Sarah Lee',
            status: 'active',
            pin: '000000',
            todaySales: 8900,
            target: 12000
        },
        {
            id: 'airport',
            name: 'Airport Branch',
            location: 'Intl Airport',
            manager: 'Mike Chen',
            status: 'active',
            pin: '000000',
            todaySales: 15200,
            target: 20000
        }
    ],

    activities: [],

    tasks: [
        { id: 1, title: 'Increase Q1 sales by 15%',        branchId: 'downtown', deadline: '2026-03-31', status: 'in_progress', priority: 'high' },
        { id: 2, title: 'Inventory audit',                 branchId: 'mall',     deadline: '2026-02-28', status: 'pending',     priority: 'medium' },
        { id: 3, title: 'Customer feedback collection',    branchId: 'airport',  deadline: '2026-02-25', status: 'completed',   priority: 'low' }
    ],

    sales: [],
    expenses: [],

    inventory: [
        { id: 1, name: 'Product A', sku: 'PRD-001', quantity: 150, minThreshold: 50,  price: 45, branchId: 'downtown' },
        { id: 2, name: 'Product B', sku: 'PRD-002', quantity: 23,  minThreshold: 30,  price: 89, branchId: 'downtown' },
        { id: 3, name: 'Product C', sku: 'PRD-003', quantity: 200, minThreshold: 100, price: 12, branchId: 'mall' },
        { id: 4, name: 'Product D', sku: 'PRD-004', quantity: 8,   minThreshold: 20,  price: 55, branchId: 'airport' }
    ],

    customers: [],
    notes: [],
    loans: [],
    assets: []
};
