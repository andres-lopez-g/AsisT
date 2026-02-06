import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Service
 * Provides AI-powered recommendations and assistance for users
 */

let genAI = null;
let model = null;

/**
 * Initialize Gemini AI with API key
 */
function initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.warn('[Gemini Service] API key not configured');
        return false;
    }
    
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
        model = genAI.getGenerativeModel({ model: modelName });
        console.log('[Gemini Service] Initialized successfully');
        return true;
    } catch (error) {
        console.error('[Gemini Service] Initialization error:', error);
        return false;
    }
}

/**
 * Check if Gemini is available
 */
export function isAvailable() {
    return model !== null;
}

/**
 * Generate AI response based on user context
 * @param {string} userMessage - User's message/question
 * @param {object} userContext - User's financial and task context
 * @returns {Promise<object>} AI response
 */
export async function generateResponse(userMessage, userContext = {}) {
    if (!model) {
        const initialized = initializeGemini();
        if (!initialized) {
            throw new Error('Gemini API not configured. Please set GEMINI_API_KEY environment variable.');
        }
    }
    
    try {
        // Build context prompt
        const contextPrompt = buildContextPrompt(userContext);
        
        // Build full prompt
        const fullPrompt = `${contextPrompt}

Usuario pregunta: ${userMessage}

Por favor, proporciona una respuesta útil y personalizada basada en el contexto financiero y de productividad del usuario. Sé conciso pero informativo. Responde en español.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        return {
            success: true,
            response: text,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('[Gemini Service] Error generating response:', error);
        throw error;
    }
}

/**
 * Get financial recommendations based on user's financial data
 * @param {object} financialData - User's financial summary
 * @returns {Promise<object>} Recommendations
 */
export async function getFinancialRecommendations(financialData) {
    if (!model) {
        const initialized = initializeGemini();
        if (!initialized) {
            throw new Error('Gemini API not configured. Please set GEMINI_API_KEY environment variable.');
        }
    }
    
    try {
        const prompt = `Como asesor financiero experto, analiza la siguiente situación financiera y proporciona 3-5 recomendaciones específicas y accionables:

Balance actual: $${financialData.balance || 0}
Ingresos totales: $${financialData.totalIncome || 0}
Gastos totales: $${financialData.totalExpenses || 0}
Deudas pendientes: $${financialData.totalDebts || 0}
Transacciones recurrentes: ${financialData.recurringCount || 0}

${financialData.categories ? `Distribución de gastos por categoría:
${financialData.categories.map(c => `- ${c.name}: $${c.amount}`).join('\n')}` : ''}

Proporciona recomendaciones claras, numeradas y enfocadas en mejorar la salud financiera. Responde en español y sé específico.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return {
            success: true,
            recommendations: text,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('[Gemini Service] Error generating recommendations:', error);
        throw error;
    }
}

/**
 * Get productivity tips based on user's tasks
 * @param {object} taskData - User's task summary
 * @returns {Promise<object>} Productivity tips
 */
export async function getProductivityTips(taskData) {
    if (!model) {
        const initialized = initializeGemini();
        if (!initialized) {
            throw new Error('Gemini API not configured. Please set GEMINI_API_KEY environment variable.');
        }
    }
    
    try {
        const prompt = `Como experto en productividad, analiza el siguiente estado de tareas y proporciona 3-4 consejos específicos:

Total de tareas: ${taskData.totalTasks || 0}
Tareas pendientes: ${taskData.pendingTasks || 0}
Tareas en progreso: ${taskData.inProgressTasks || 0}
Tareas completadas: ${taskData.completedTasks || 0}
Tareas de alta prioridad: ${taskData.highPriorityTasks || 0}

${taskData.overcommitment ? 'NOTA: El usuario parece tener sobrecarga de tareas.' : ''}

Proporciona consejos prácticos y motivadores para mejorar la productividad. Responde en español.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return {
            success: true,
            tips: text,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('[Gemini Service] Error generating tips:', error);
        throw error;
    }
}

/**
 * Build context prompt from user data
 */
function buildContextPrompt(userContext) {
    const parts = ['Eres AsisT, un asistente personal inteligente que ayuda con finanzas y productividad.'];
    
    if (userContext.balance !== undefined) {
        parts.push(`Balance actual del usuario: $${userContext.balance}`);
    }
    
    if (userContext.totalIncome !== undefined) {
        parts.push(`Ingresos totales: $${userContext.totalIncome}`);
    }
    
    if (userContext.totalExpenses !== undefined) {
        parts.push(`Gastos totales: $${userContext.totalExpenses}`);
    }
    
    if (userContext.pendingTasks !== undefined) {
        parts.push(`Tareas pendientes: ${userContext.pendingTasks}`);
    }
    
    if (userContext.completedTasks !== undefined) {
        parts.push(`Tareas completadas: ${userContext.completedTasks}`);
    }
    
    return parts.join('\n');
}

// Initialize on module load
initializeGemini();
