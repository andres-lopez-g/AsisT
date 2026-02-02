/**
 * Debt Optimizer Service
 * Calculates optimal debt payoff strategies (Avalanche vs Snowball)
 */

/**
 * Calculate debt payoff using Avalanche method (highest interest first)
 * @param {Array} debts - List of debts with {id, title, remaining_amount, interest_rate, minimum_payment}
 * @param {number} extraPayment - Extra amount to pay monthly beyond minimums
 * @returns {Object} Payoff plan with timeline and total interest
 */
function calculateAvalanche(debts, extraPayment = 0) {
    // Sort by interest rate (highest first)
    const sortedDebts = [...debts].sort((a, b) =>
        parseFloat(b.interest_rate) - parseFloat(a.interest_rate)
    );

    return calculatePayoffPlan(sortedDebts, extraPayment, 'avalanche');
}

/**
 * Calculate debt payoff using Snowball method (smallest balance first)
 * @param {Array} debts - List of debts
 * @param {number} extraPayment - Extra amount to pay monthly beyond minimums
 * @returns {Object} Payoff plan with timeline and total interest
 */
function calculateSnowball(debts, extraPayment = 0) {
    // Sort by remaining amount (smallest first)
    const sortedDebts = [...debts].sort((a, b) =>
        parseFloat(a.remaining_amount) - parseFloat(b.remaining_amount)
    );

    return calculatePayoffPlan(sortedDebts, extraPayment, 'snowball');
}

/**
 * Core payoff calculation logic
 */
function calculatePayoffPlan(sortedDebts, extraPayment, method) {
    const plan = [];
    const debtsCopy = sortedDebts.map(d => ({
        ...d,
        remaining: parseFloat(d.remaining_amount),
        rate: parseFloat(d.interest_rate) / 100 / 12, // Monthly rate
        minPayment: parseFloat(d.remaining_amount) / parseFloat(d.installments_total - d.installments_paid || 12)
    }));

    let month = 0;
    let totalInterestPaid = 0;
    const monthlySnapshots = [];

    while (debtsCopy.some(d => d.remaining > 0)) {
        month++;
        if (month > 600) break; // Safety limit (50 years)

        let availableExtra = extraPayment;
        const monthSnapshot = { month, debts: [] };

        // Pay minimums on all debts first
        for (const debt of debtsCopy) {
            if (debt.remaining <= 0) continue;

            // Calculate interest for this month
            const interest = debt.remaining * debt.rate;
            totalInterestPaid += interest;

            // Pay minimum (or remaining balance if less)
            const payment = Math.min(debt.minPayment, debt.remaining + interest);
            const principal = payment - interest;

            debt.remaining -= principal;

            monthSnapshot.debts.push({
                id: debt.id,
                title: debt.title,
                payment,
                principal,
                interest,
                remaining: Math.max(0, debt.remaining)
            });
        }

        // Apply extra payment to first debt with balance
        for (const debt of debtsCopy) {
            if (debt.remaining > 0 && availableExtra > 0) {
                const extraApplied = Math.min(availableExtra, debt.remaining);
                debt.remaining -= extraApplied;
                availableExtra -= extraApplied;

                // Update snapshot
                const debtSnapshot = monthSnapshot.debts.find(d => d.id === debt.id);
                if (debtSnapshot) {
                    debtSnapshot.payment += extraApplied;
                    debtSnapshot.principal += extraApplied;
                    debtSnapshot.remaining = Math.max(0, debt.remaining);
                }

                break; // Only apply to one debt per month
            }
        }

        monthlySnapshots.push(monthSnapshot);
    }

    // Calculate summary
    const totalPaid = sortedDebts.reduce((sum, d) => sum + parseFloat(d.remaining_amount), 0) + totalInterestPaid;

    return {
        method,
        months: month,
        years: (month / 12).toFixed(1),
        totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        monthlySnapshots: monthlySnapshots.filter((_, i) => i % 6 === 0), // Sample every 6 months
        payoffOrder: sortedDebts.map(d => ({ id: d.id, title: d.title }))
    };
}

/**
 * Compare Avalanche vs Snowball methods
 * @param {Array} debts - List of debts
 * @param {number} extraPayment - Extra monthly payment
 * @returns {Object} Comparison of both methods
 */
function compareStrategies(debts, extraPayment = 0) {
    const avalanche = calculateAvalanche(debts, extraPayment);
    const snowball = calculateSnowball(debts, extraPayment);

    const interestSaved = snowball.totalInterestPaid - avalanche.totalInterestPaid;
    const monthsSaved = snowball.months - avalanche.months;

    return {
        avalanche,
        snowball,
        comparison: {
            interestSaved: Math.round(interestSaved * 100) / 100,
            monthsSaved,
            recommendation: interestSaved > 100 ? 'avalanche' : 'snowball',
            reasoning: interestSaved > 100
                ? `Avalanche saves $${interestSaved.toFixed(2)} in interest`
                : 'Snowball provides psychological wins with faster debt elimination'
        }
    };
}

/**
 * Suggest safe extra payment amount based on current balance and recurring expenses
 * @param {number} currentBalance - Current account balance
 * @param {number} monthlyRecurringExpenses - Total monthly recurring expenses
 * @param {number} safetyBuffer - Minimum balance to maintain (default 500)
 * @returns {Object} Suggested extra payment amounts
 */
function suggestExtraPayment(currentBalance, monthlyRecurringExpenses, safetyBuffer = 500) {
    const available = currentBalance - monthlyRecurringExpenses - safetyBuffer;

    if (available <= 0) {
        return {
            conservative: 0,
            moderate: 0,
            aggressive: 0,
            message: 'Focus on building emergency fund first'
        };
    }

    return {
        conservative: Math.round(available * 0.25),
        moderate: Math.round(available * 0.50),
        aggressive: Math.round(available * 0.75),
        message: `You have $${available.toFixed(2)} available after expenses and safety buffer`
    };
}

/**
 * Calculate debt-free date with different payment scenarios
 * @param {Array} debts - List of debts
 * @param {Array} extraPaymentOptions - Array of extra payment amounts to test
 * @returns {Array} Scenarios with payoff dates
 */
function calculateScenarios(debts, extraPaymentOptions = [0, 50, 100, 200]) {
    return extraPaymentOptions.map(extra => {
        const result = calculateAvalanche(debts, extra);
        const debtFreeDate = new Date();
        debtFreeDate.setMonth(debtFreeDate.getMonth() + result.months);

        return {
            extraPayment: extra,
            months: result.months,
            debtFreeDate: debtFreeDate.toISOString().split('T')[0],
            totalInterest: result.totalInterestPaid
        };
    });
}

export {
    calculateAvalanche,
    calculateSnowball,
    compareStrategies,
    suggestExtraPayment,
    calculateScenarios
};
