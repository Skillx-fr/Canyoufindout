import { NextResponse } from 'next/server';
import * as whoiserLib from 'whoiser';
// Gestion compatibilité CommonJS/ESM
const whoiser = (whoiserLib as any).default || whoiserLib;
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

        // Exécution du WHOIS
        // whoiser retourne un objet avec les serveurs interrogés (ex: "whois.verisign-grs.com": {...})
        const whoisResult = await whoiser(hostname);

        // On essaie de normaliser un peu la sortie pour le frontend, 
        // ou on renvoie tout et le frontend affichera le premier résultat pertinent.
        // whoiser retourne souvent plusieurs clés (TLD whois, Registrar whois).
        // On va tout renvoyer, le frontend filtrera.

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
