import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';
import { rateLimit } from '@/lib/rate-limit';
import { isValidUrl, normalizeUrl, extractHostname } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Rate Limiter: 500 tokens uniques par minute, permet 20 requêtes/min par IP
const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 60 * 1000,
});

export async function POST(request: Request) {
    try {
        // 1. Identification IP (Support Vercel/Proxies)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

        // 2. Check Rate Limit
        const { isRateLimited } = limiter.check(20, ip);
        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Trop de requêtes. Veuillez patienter une minute.' },
                { status: 429 }
            );
        }

        // 3. Parsing et Validation
        const body = await request.json();
        const { url } = body;
        const normalizedUrl = normalizeUrl(url);

        if (!url || !isValidUrl(normalizedUrl)) {
            return NextResponse.json(
                { error: 'URL fournie invalide.' },
                { status: 400 }
            );
        }

        const hostname = extractHostname(normalizedUrl);
        if (!hostname) {
            return NextResponse.json({ error: 'Impossible d\'extraire le domaine.' }, { status: 400 });
        }

        logger.info('Scan DNS initié', { hostname, ip });

        // 4. Exécution des résolutions DNS en parallèle
        // On utilise Promise.allSettled pour ne pas échouer si un type d'enregistrement manque
        const [a, aaaa, mx, txt, ns] = await Promise.allSettled([
            dns.resolve4(hostname).catch(() => []),
            dns.resolve6(hostname).catch(() => []),
            dns.resolveMx(hostname).catch(() => []),
            dns.resolveTxt(hostname).catch(() => []),
            dns.resolveNs(hostname).catch(() => []),
        ]);

        // 5. Formatage de la réponse
        const results = {
            hostname,
            timestamp: new Date().toISOString(),
            records: {
                A: a.status === 'fulfilled' ? a.value : [],
                AAAA: aaaa.status === 'fulfilled' ? aaaa.value : [],
                MX: mx.status === 'fulfilled' ? mx.value : [],
                TXT: txt.status === 'fulfilled' ? txt.value.flat() : [],
                NS: ns.status === 'fulfilled' ? ns.value : [],
            }
        };

        return NextResponse.json(results);

    } catch (error) {
        logger.error('Erreur lors du scan DNS', error);
        return NextResponse.json(
            { error: 'Une erreur interne est survenue lors du scan DNS.' },
            { status: 500 }
        );
    }
}
