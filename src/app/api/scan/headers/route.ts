import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { isValidUrl, normalizeUrl, extractHostname } from '@/lib/utils';
import { logger } from '@/lib/logger';

const limiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60 * 1000 });

interface HeaderCheck {
    header: string;
    status: 'present' | 'missing' | 'warning';
    value: string | null;
    message: string;
}

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const { isRateLimited } = limiter.check(20, ip);
        if (isRateLimited) return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 });

        const body = await request.json();
        const { url } = body;
        const targetUrl = normalizeUrl(url);

        if (!url || !isValidUrl(targetUrl)) {
            return NextResponse.json({ error: 'URL invalide.' }, { status: 400 });
        }

        logger.info('Scan Headers initié', { url: targetUrl, ip });

        // Tentative HEAD request
        let response: Response;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            response = await fetch(targetUrl, {
                method: 'HEAD',
                redirect: 'follow',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok && response.status === 405) {
                // Fallback GET si HEAD interdit
                const controller2 = new AbortController();
                const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
                response = await fetch(targetUrl, {
                    method: 'GET',
                    redirect: 'follow',
                    signal: controller2.signal
                });
                clearTimeout(timeoutId2);
            }
        } catch (err) {
            // Erreur réseau ou timeout
            return NextResponse.json({ error: 'Impossible de joindre la cible (Timeout ou Erreur SSL).' }, { status: 502 });
        }

        const headers = response.headers;
        const securityHeaders: HeaderCheck[] = [];

        // Analyse des headers courants
        const checks = [
            { name: 'strict-transport-security', label: 'HSTS (Strict-Transport-Security)' },
            { name: 'content-security-policy', label: 'CSP (Content-Security-Policy)' },
            { name: 'x-frame-options', label: 'X-Frame-Options' },
            { name: 'x-content-type-options', label: 'X-Content-Type-Options' },
            { name: 'referrer-policy', label: 'Referrer-Policy' },
            { name: 'permissions-policy', label: 'Permissions-Policy' },
            { name: 'server', label: 'Server Banner' }, // Information Disclosure
            { name: 'x-powered-by', label: 'X-Powered-By' }, // Information Disclosure
        ];

        checks.forEach(check => {
            const value = headers.get(check.name);
            if (value) {
                let status: 'present' | 'warning' = 'present';
                // Cas spécifiques pour warning
                if (check.name === 'x-powered-by') status = 'warning'; // Divulgation d'info

                securityHeaders.push({
                    header: check.label,
                    status,
                    value,
                    message: status === 'warning' ? 'Divulgation potentielle de technologie.' : 'Présent.'
                });
            } else {
                // Seuls les headers de sécurité manquants sont notés 'missing', pas les info disclosure
                const isSecurity = ['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options'].includes(check.name);
                if (isSecurity) {
                    securityHeaders.push({
                        header: check.label,
                        status: 'missing',
                        value: null,
                        message: 'Recommandé pour la sécurité.'
                    });
                }
            }
        });

        return NextResponse.json({
            url: targetUrl,
            finalUrl: response.url, // Pour détecter les redirections
            statusCode: response.status,
            securityAnalysis: securityHeaders,
            rawHeaders: Object.fromEntries(headers.entries())
        });

    } catch (error) {
        logger.error('Erreur Scan Headers', error);
        return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
    }
}
