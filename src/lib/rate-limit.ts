import { LRUCache } from 'lru-cache';
import { logger } from '@/lib/logger';

type RateLimitOptions = {
    uniqueTokenPerInterval: number; // Max uniques users per window
    interval: number; // Window size in ms
};

/**
 * Rate Limiter 'Best Effort' en mémoire.
 * Note: Sur Vercel Serverless, l'état n'est pas partagé entre les lambdas.
 * Cela sert surtout à prévenir les abus rapides sur une même instance chaude.
 */
export function rateLimit(options: RateLimitOptions) {
    const tokenCache = new LRUCache<string, number>({
        max: options.uniqueTokenPerInterval || 500,
        ttl: options.interval || 60000,
    });

    return {
        check: (limit: number, token: string) => {
            const tokenCount = tokenCache.get(token) || 0;
            const currentUsage = tokenCount + 1;

            tokenCache.set(token, currentUsage);

            const isRateLimited = currentUsage > limit;

            if (isRateLimited) {
                logger.warn('Rate limit exceeded', { token, currentUsage, limit });
            }

            return {
                isRateLimited,
                currentUsage,
                limit,
                remaining: Math.max(0, limit - currentUsage),
            };
        },
    };
}
