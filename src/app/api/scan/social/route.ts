import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { isValidUrl, normalizeUrl } from '@/lib/utils';
import { logger } from '@/lib/logger';

const limiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60 * 1000 });

// Liste de domaines sociaux à détecter
const SOCIAL_DOMAINS = [
    'facebook.com', 'twitter.com', 'x.com', 'linkedin.com',
    'instagram.com', 'github.com', 'gitlab.com', 'youtube.com',
    'tiktok.com', 'discord.gg', 'discord.com/invite', 't.me', 'telegram.me'
];

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

        // Rate check
        const { isRateLimited } = limiter.check(20, ip);
        if (isRateLimited) return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 });

        const body = await request.json();
        const { url } = body;
        const targetUrl = normalizeUrl(url);

        if (!url || !isValidUrl(targetUrl)) {
            return NextResponse.json({ error: 'URL invalide.' }, { status: 400 });
        }

        logger.info('Scan Social initié', { url: targetUrl, ip });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s max

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ReconSight/1.0; +https://reconsight.vercel.app)'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json({ error: `Impossible de récupérer le contenu (${response.status}).` }, { status: response.status });
        }

        const html = await response.text();

        // Extraction simple via Regex (Approche 'Best Effort')
        // Note: Une extraction robuste nécessiterait un parser DOM (JSDOM/Cheerio) mais serait plus lourde.
        const socialLinks = new Set<string>();
        const hrefRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
        let match;

        while ((match = hrefRegex.exec(html)) !== null) {
            const link = match[1];
            if (SOCIAL_DOMAINS.some(domain => link.includes(domain))) {
                socialLinks.add(link);
            }
        }

        // Extraction basique d'emails
        const emails = new Set<string>();
        // Regex e-mail "suffisante" pour du recon
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        let emailMatch;

        // Limite de recherche brute
        const contentToSearch = html.substring(0, 500000); // Analyse les 500 premiers KB seulement pour perf

        while ((emailMatch = emailRegex.exec(contentToSearch)) !== null) {
            const mail = emailMatch[0];
            // Filtrer les faux positifs courants (images, fichiers)
            if (!mail.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i)) {
                emails.add(mail);
            }
        }

        return NextResponse.json({
            socials: Array.from(socialLinks),
            emails: Array.from(emails).slice(0, 20) // Max 20 emails
        });

    } catch (error) {
        logger.error('Erreur Scan Social', error);
        return NextResponse.json({ error: 'Erreur lors du scan social.' }, { status: 500 });
    }
}
