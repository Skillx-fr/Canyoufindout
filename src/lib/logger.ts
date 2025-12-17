/**
 * Système de journalisation simple pour ReconSight.
 * Permet de standardiser les logs et de faciliter le débogage.
 */

export const logger = {
    info: (message: string, context?: Record<string, unknown>) => {
        console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...context }));
    },
    error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
        console.error(JSON.stringify({
            level: 'error',
            message,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            ...context
        }));
    },
    warn: (message: string, context?: Record<string, unknown>) => {
        console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...context }));
    },
    debug: (message: string, context?: Record<string, unknown>) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(JSON.stringify({ level: 'debug', message, timestamp: new Date().toISOString(), ...context }));
        }
    }
};
