// ── Owner: Billing & Plans (Snippe) ────────────────────────────────────────────────

export async function renderOwnerBilling() {
    const container = document.getElementById('billingSettingsContainer');
    if (!container) return; // Prevent errors if tab not open

    // Skeleton loader
    container.innerHTML = `
    <div class="slide-in w-full">
        <div class="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
    </div>`;

    try {
        // Fetch current profile plan info
        let profile = await dbProfile.fetch(state.ownerId);
        if (!profile) throw new Error('Could not load profile');

        const currentPlan = profile.plan || 'free_trial';
        const trialEnds = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
        const now = new Date();
        const isTrialActive = currentPlan === 'free_trial' && trialEnds && trialEnds > now;
        const trialDaysLeft = isTrialActive ? Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)) : 0;

        // Define plans
        const plans = [
            { id: 'starter', name: 'Starter', price: 'TZS 25,000 / mo', limits: 'Up to 2 Branches', features: ['Core Reporting', '1,000 Sales/mo', 'Basic Support'], color: 'blue' },
            { id: 'pro', name: 'Pro', price: 'TZS 75,000 / mo', limits: 'Up to 5 Branches', features: ['Advanced Analytics', 'Unlimited Sales', 'Priority Support', 'API Access', 'Custom Receipts'], color: 'indigo', popular: true },
            { id: 'enterprise', name: 'Enterprise', price: 'TZS 200,000 / mo', limits: 'Unlimited Branches', features: ['Everything in Pro', 'White-label UI', 'Dedicated Account Manager', 'SLA 99.9%'], color: 'violet' }
        ];

        let html = `
        <div class="slide-in w-full space-y-8">
            <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full pointer-events-none transition-colors"></div>
                <div class="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Your Current Plan</h2>
                            <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-gray-200 dark:border-gray-600">
                                ${currentPlan.replace('_', ' ')}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-lg mb-4">
                            ${isTrialActive
                ? `You are currently on a free trial. You have <strong class="text-indigo-600 dark:text-indigo-400">${trialDaysLeft} days left</strong> before you need to upgrade to continue using premium features.`
                : currentPlan === 'free_trial'
                    ? `Your trial has expired. Please choose a plan below to restore full access to your business.`
                    : `You are currently subscribed to the ${currentPlan.toUpperCase()} plan. Your billing is managed securely via Snippe Payments.`
            }
                        </p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">`;

        plans.forEach(plan => {
            const isCurrent = currentPlan === plan.id;
            const btnClass = isCurrent
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : plan.popular
                    ? 'btn-primary'
                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50';

            html += `
                <div class="relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border ${plan.popular ? 'border-indigo-500 shadow-indigo-500/10' : 'border-gray-100 dark:border-gray-700'} flex flex-col transition-transform hover:-translate-y-1">
                    ${plan.popular ? '<div class="absolute top-0 inset-x-0 h-1.5 bg-indigo-500 rounded-t-3xl"></div><div class="absolute top-0 right-6 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">Most Popular</div>' : ''}
                    
                    <div class="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] mb-1 opacity-80 mt-2">${plan.limits}</div>
                    <h3 class="text-xl font-black text-gray-900 dark:text-white mb-2">${plan.name}</h3>
                    <div class="text-2xl tracking-tighter font-black text-indigo-600 dark:text-indigo-400 mb-6">${plan.price}</div>
                    
                    <ul class="space-y-3 mb-8 flex-1">
                        ${plan.features.map(f => `
                            <li class="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                <i data-lucide="check-circle-2" class="w-4 h-4 text-indigo-500 flex-shrink-0"></i>
                                ${f}
                            </li>
                        `).join('')}
                    </ul>
                    
                    <button 
                        onclick="initiateSnippeCheckout('${plan.id}', '${plan.name}', '${plan.price}')" 
                        class="w-full py-3 rounded-xl justify-center font-bold transition-all text-sm ${btnClass}"
                        ${isCurrent ? 'disabled' : ''}
                    >
                        ${isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </button>
                </div>
            `;
        });

        html += `
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700">
                <i data-lucide="shield-check" class="w-6 h-6 text-emerald-500 mx-auto mb-2"></i>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Secure Payments by Snippe</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">All transactions are processed securely through Snippe. We do not store your mobile money or credit card information on our servers.</p>
            </div>
        </div>`;

        container.innerHTML = html;
        lucide.createIcons();

    } catch (err) {
        console.error(err);
        container.innerHTML = `
        <div class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30">
            <i data-lucide="alert-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50"></i>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Could not load billing information</h3>
            <p class="text-gray-500 dark:text-gray-400 mt-2">${err.message}</p>
        </div>`;
        lucide.createIcons();
    }
};

export async function initiateSnippeCheckout(planId, planName, planPrice) {
    if (!state.ownerId) return;

    // We will simulate the Snippe Hosted Checkout Modal 
    // In production, this would make a backend call to POST /api/v1/sessions
    // and redirect the user to the `redirect_url` provided by Snippe.

    // For this prototype, we mock the success flow.
    const priceValue = parseInt(planPrice.replace(/[^0-9]/g, ''));

    const html = `
    <div class="p-6 md:p-8">
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-white border border-gray-100 shadow-sm rounded-2xl mx-auto flex items-center justify-center mb-4">
               <img src="logo.jpg" class="w-10 h-10 object-contain rounded-lg" alt="Logo"/>
            </div>
            <h3 class="text-xl font-black text-gray-900">Upgrade to ${planName}</h3>
            <p class="text-sm text-gray-500 font-medium mt-1">Amount due today: <strong>${planPrice}</strong></p>
        </div>

        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 relative overflow-hidden">
            <div class="absolute inset-0 bg-blue-500/5 flex items-center justify-center pointer-events-none">
                <i data-lucide="lock" class="w-24 h-24 text-blue-500/10 -rotate-12"></i>
            </div>
            <p class="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 z-10 relative">
                <i data-lucide="lock" class="w-3 h-3"></i> Snippe Secure Checkout
            </p>
            <p class="text-xs text-gray-500 z-10 relative">In a production environment, you would be redirected to the secure Snippe payment portal to complete this transaction via Mobile Money (M-Pesa, Tigo Pesa) or Card.</p>
        </div>

        <button onclick="simulateSnippePaymentSuccess('${planId}', ${priceValue})" class="w-full btn-primary py-3 rounded-xl justify-center font-bold shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4"></i> Simulate Payment Success
        </button>
        <button onclick="closeModal()" class="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
            Cancel
        </button>
    </div>
    `;

    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').classList.remove('hidden');
    lucide.createIcons();
};

export async function simulateSnippePaymentSuccess(planId, mrrAmount) {
    const btn = document.querySelector('#modalContent .btn-primary');
    if (btn) {
        btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Processing...';
        btn.disabled = true;
        lucide.createIcons();
    }

    try {
        // 1. Fetch current profile to get old plan
        const { data: profile } = await supabaseClient.from('profiles').select('plan').eq('id', state.ownerId).single();
        const oldPlan = profile?.plan || 'free_trial';

        // 2. Update Plan
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({
                plan: planId,
                snippe_subscription_id: 'sub_simulated_' + Math.random().toString(36).substring(7)
            })
            .eq('id', state.ownerId);

        if (profileError) throw profileError;

        // 3. Log into Audit Log for SaaS MRR Metrics
        await supabaseClient.from('saas_audit_logs').insert({
            owner_id: state.ownerId,
            event_type: 'upgraded',
            previous_plan: oldPlan,
            new_plan: planId,
            mrr_change: mrrAmount
        });

        // 4. Update UI
        closeModal();
        showToast('Payment successful! Plan upgraded.', 'success');

        // Ensure state profile is updated locally
        if (state.profile) {
            state.profile.plan = planId;
        }

        // Re-render
        renderOwnerBilling();

    } catch (err) {
        console.error(err);
        showToast('Subscription upgrade failed: ' + err.message, 'error');
        closeModal();
    }
};
