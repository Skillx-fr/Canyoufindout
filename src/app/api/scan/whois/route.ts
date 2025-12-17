import { NextResponse } from 'next/server';
import * as whoiserLib from 'whoiser';
// Récupération explicite de la fonction whoisDomain
const whoisDomain = (whoiserLib as any).whoisDomain || whoiserLib;
import { rateLimit } from '@/lib/rate-limit';
import { isValidUrl, normalizeUrl, extractHostname } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Rate Limited mais un peu plus strict car WHOIS est lent/sensible
const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 60 * 1000,
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

        // Rate Limit (10 req/min pour WHOIS)
        const { isRateLimited } = limiter.check(10, ip);

        if (isRateLimited) {
            return NextResponse.json(
                { error: 'Trop de requêtes WHOIS. Veuillez patienter.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { url } = body;
        const normalizedUrl = normalizeUrl(url);

        if (!url || !isValidUrl(normalizedUrl)) {
            return NextResponse.json({ error: 'URL invalide.' }, { status: 400 });
        }

        const hostname = extractHostname(normalizedUrl);
        logger.info('Scan WHOIS initié', { hostname, ip });

        // Exécution du WHOIS (whoisDomain)
        const whoisResult = await whoisDomain(hostname);

        // On retourne tout le résultat pour le frontend

        // Petit nettoyage pour s'assurer que c'est sérialisable
        const cleanResult = JSON.parse(JSON.stringify(whoisResult));

        return NextResponse.json({
            hostname,
            data: cleanResult
        });

    } catch (error) {
        logger.error('Erreur Scan WHOIS', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération WHOIS.' },
            { status: 500 }
        );
    }
}
