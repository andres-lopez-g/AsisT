/**
 * Task Intelligence Service
 * Provides smart task prioritization and pattern detection
 */

const { parseISO, differenceInDays, addDays, isPast } = require('date-fns');

/**
 * Calculate priority score for a task (0-100)
 * @param {Object} task - Task object with {title, date, priority, status, created_at}
 * @returns {number} Priority score (0-100, higher = more urgent)
 */
function calculatePriorityScore(task) {
    let score = 0;

    // 1. User-set priority (0-40 points)
    const priorityPoints = {
        'high': 40,
        'medium': 20,
        'low': 10
    };
    score += priorityPoints[task.priority] || 20;

    // 2. Deadline proximity (0-40 points)
    if (task.date) {
        const daysUntilDue = differenceInDays(parseISO(task.date), new Date());

        if (daysUntilDue < 0) {
            score += 40; // Overdue
        } else if (daysUntilDue === 0) {
            score += 35; // Due today
        } else if (daysUntilDue <= 1) {
            score += 30; // Due tomorrow
        } else if (daysUntilDue <= 3) {
            score += 25; // Due within 3 days
        } else if (daysUntilDue <= 7) {
            score += 15; // Due within a week
        } else if (daysUntilDue <= 14) {
            score += 10; // Due within 2 weeks
        } else {
            score += 5; // Due later
        }
    }

    // 3. Task age (0-20 points)
    const daysOld = differenceInDays(new Date(), parseISO(task.created_at));
    if (daysOld > 30) {
        score += 20; // Very old task
    } else if (daysOld > 14) {
        score += 15;
    } else if (daysOld > 7) {
        score += 10;
    } else {
        score += 5;
    }

    return Math.min(100, score);
}

/**
 * Get top N priority tasks for Focus Mode
 * @param {Array} tasks - List of tasks
 * @param {number} limit - Number of tasks to return (default 3)
 * @returns {Array} Top priority tasks with scores
 */
function getFocusTasks(tasks, limit = 3) {
    // Only consider todo and in-progress tasks
    const activeTasks = tasks.filter(t => t.status !== 'done');

    // Calculate scores
    const scored = activeTasks.map(task => ({
        ...task,
        urgencyScore: calculatePriorityScore(task)
    }));

    // Sort by score (highest first)
    scored.sort((a, b) => b.urgencyScore - a.urgencyScore);

    return scored.slice(0, limit);
}

/**
 * Detect recurring task patterns
 * @param {Array} tasks - All tasks (including completed)
 * @returns {Array} Detected recurring patterns
 */
function detectRecurringTasks(tasks) {
    const patterns = [];
    const titleGroups = {};

    // Group tasks by similar titles
    for (const task of tasks) {
        const normalized = normalizeTitle(task.title);
        if (!titleGroups[normalized]) {
            titleGroups[normalized] = [];
        }
        titleGroups[normalized].push(task);
    }

    // Analyze each group for recurring patterns
    for (const [title, group] of Object.entries(titleGroups)) {
        if (group.length >= 3) {
            // Sort by creation date
            const sorted = group.sort((a, b) =>
                new Date(a.created_at) - new Date(b.created_at)
            );

            // Calculate intervals
            const intervals = [];
            for (let i = 1; i < sorted.length; i++) {
                const days = differenceInDays(
                    parseISO(sorted[i].created_at),
                    parseISO(sorted[i - 1].created_at)
                );
                intervals.push(days);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

            // Determine if it's a recurring pattern
            let frequency = null;
            if (avgInterval >= 6 && avgInterval <= 8) frequency = 'weekly';
            else if (avgInterval >= 28 && avgInterval <= 32) frequency = 'monthly';

            if (frequency) {
                const lastTask = sorted[sorted.length - 1];
                const nextSuggested = addDays(parseISO(lastTask.created_at), Math.round(avgInterval));

                patterns.push({
                    title,
                    frequency,
                    occurrences: group.length,
                    avgInterval: Math.round(avgInterval),
                    lastCreated: lastTask.created_at,
                    nextSuggested: nextSuggested.toISOString().split('T')[0],
                    shouldSuggest: differenceInDays(new Date(), nextSuggested) >= 0
                });
            }
        }
    }

    return patterns;
}

/**
 * Normalize task title for pattern matching
 */
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[0-9]/g, '') // Remove numbers
        .replace(/\b(weekly|monthly|daily)\b/g, '') // Remove frequency words
        .trim();
}

/**
 * Suggest realistic deadline for a task based on similar past tasks
 * @param {string} title - Task title
 * @param {Array} completedTasks - List of completed tasks
 * @returns {Object} Suggested deadline and reasoning
 */
function suggestDeadline(title, completedTasks) {
    const normalized = normalizeTitle(title);

    // Find similar completed tasks
    const similar = completedTasks.filter(t => {
        const taskNormalized = normalizeTitle(t.title);
        return taskNormalized.includes(normalized) || normalized.includes(taskNormalized);
    });

    if (similar.length === 0) {
        return {
            suggested: addDays(new Date(), 7).toISOString().split('T')[0],
            confidence: 'low',
            reasoning: 'No similar tasks found. Suggesting 1 week as default.'
        };
    }

    // Calculate average completion time
    const completionTimes = similar.map(t => {
        const created = parseISO(t.created_at);
        const completed = t.date ? parseISO(t.date) : new Date();
        return differenceInDays(completed, created);
    });

    const avgDays = Math.round(
        completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    );

    return {
        suggested: addDays(new Date(), avgDays).toISOString().split('T')[0],
        confidence: similar.length >= 3 ? 'high' : 'medium',
        reasoning: `Based on ${similar.length} similar task(s), average completion time is ${avgDays} days.`
    };
}

/**
 * Check for overcommitment (too many high-priority tasks)
 * @param {Array} tasks - Active tasks
 * @returns {Object} Overcommitment analysis
 */
function checkOvercommitment(tasks) {
    const activeTasks = tasks.filter(t => t.status !== 'done');
    const highPriority = activeTasks.filter(t => t.priority === 'high');
    const dueSoon = activeTasks.filter(t => {
        if (!t.date) return false;
        const daysUntil = differenceInDays(parseISO(t.date), new Date());
        return daysUntil >= 0 && daysUntil <= 7;
    });

    const isOvercommitted = highPriority.length > 5 || dueSoon.length > 10;

    return {
        isOvercommitted,
        totalActive: activeTasks.length,
        highPriorityCount: highPriority.length,
        dueSoonCount: dueSoon.length,
        warning: isOvercommitted
            ? 'You may be overcommitted. Consider deferring or delegating some tasks.'
            : null
    };
}

/**
 * Calculate task completion velocity (tasks per week)
 * @param {Array} completedTasks - List of completed tasks
 * @param {number} weeks - Number of weeks to analyze (default 4)
 * @returns {Object} Velocity metrics
 */
function calculateVelocity(completedTasks, weeks = 4) {
    const cutoffDate = addDays(new Date(), -weeks * 7);
    const recentCompleted = completedTasks.filter(t =>
        parseISO(t.created_at) >= cutoffDate
    );

    const tasksPerWeek = recentCompleted.length / weeks;

    return {
        tasksPerWeek: Math.round(tasksPerWeek * 10) / 10,
        totalCompleted: recentCompleted.length,
        weeksAnalyzed: weeks,
        trend: tasksPerWeek > 5 ? 'high' : tasksPerWeek > 2 ? 'moderate' : 'low'
    };
}

module.exports = {
    calculatePriorityScore,
    getFocusTasks,
    detectRecurringTasks,
    suggestDeadline,
    checkOvercommitment,
    calculateVelocity
};
