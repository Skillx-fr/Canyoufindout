import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine les classes CSS dynamiquement avec tailwind-merge.
 * Indispensable pour créer des composants réutilisables avec Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Valide si une chaîne est une URL valide.
 * Accepte uniquement les protocoles http et https.
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Tente de normaliser une entrée utilisateur en URL valide.
 * Ajoute https:// si manquant.
 */
export function normalizeUrl(input: string): string {
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
        return `https://${input}`;
    }
    return input;
}

/**
 * Extrait le hostname d'une URL pour l'affichage ou le scan.
 */
export function extractHostname(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        return '';
    }
}
