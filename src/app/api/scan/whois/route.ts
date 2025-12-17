import { NextResponse } from 'next/server';
import * as whoiserLib from 'whoiser';
import { rateLimit } from '@/lib/rate-limit';
import { isValidUrl, normalizeUrl, extractHostname, getRootDomain } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Récupération explicite de la fonction whoisDomain
// Gestion compatibilité CommonJS/ESM
const whoisDomain = (whoiserLib as any).whoisDomain || whoiserLib;

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
        // Pour WHOIS, on doit utiliser le domaine racine (ex: leakmited.com au lieu de platform.leakmited.com)
        const rootDomain = getRootDomain(hostname);

        logger.info('Scan WHOIS initié', { hostname, rootDomain, ip });

        // Exécution du WHOIS (whoisDomain) sur le rootDomain
        const whoisResult = await whoisDomain(rootDomain);

        return NextResponse.json({
            hostname, // On renvoie le hostname original pour le contexte
            rootDomain,
            data: JSON.parse(JSON.stringify(whoisResult))
        });

    } catch (error) {
        logger.error('Erreur Scan WHOIS', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération WHOIS.' },
            { status: 500 }
        );
    }
}
