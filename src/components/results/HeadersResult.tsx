import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Shield, Check, X, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeadersResultProps {
    data: any;
    loading: boolean;
    error: any;
}

import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";

// Définitions des tooltips pour les headers
const HEADER_TOOLTIPS: Record<string, string> = {
    'HSTS': 'HTTP Strict Transport Security. Force le navigateur à utiliser uniquement des connexions HTTPS sécurisées.',
    'CSP': 'Content Security Policy. Définit quelles ressources (scripts, images, etc.) sont autorisées à charger pour prévenir les attaques XSS.',
    'X-Frame-Options': 'Empêche le site d\'être affiché dans une iframe, protégeant contre les attaques de type Clickjacking.',
    'X-Content-Type-Options': 'Empêche le navigateur de deviner le type de fichier (MIME sniffing), réduisant les risques d\'exécution de scripts malveillants.',
    'Referrer-Policy': 'Contrôle la quantité d\'informations de navigation envoyées avec les requêtes (Referer header).',
    'Permissions-Policy': 'Définit quelles fonctionnalités du navigateur (caméra, micro, géoloc) le site a le droit d\'utiliser.',
    'Server': 'Divulgation du logiciel serveur (Information Disclosure). Masquer cette information complique la reconnaissance pour les attaquants.',
    'X-Powered-By': 'Indique la technologie utilisée (ex: Express, PHP, ASP.NET). À masquer pour éviter de faciliter le ciblage d\'exploits.',
};

export function HeadersResult({ data, loading, error }: HeadersResultProps) {
    if (loading) return <CardLoading title="Sécurité HTTP" />;
    if (error) return <CardError title="Sécurité HTTP" message={error} />;
    if (!data) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    En-têtes de Sécurité
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {data.securityAnalysis.map((check: any, idx: number) => {
                        const tooltip = HEADER_TOOLTIPS[check.header] || `Analyse de l'en-tête ${check.header}`;
                        return (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <StatusIcon status={check.status} />
                                    <LabelWithTooltip label={check.header} tooltip={tooltip} />
                                </div>
                                <div className="text-xs text-gray-400 text-right">
                                    {check.status === 'present' ? <span className="text-green-400/80">Activé</span> : check.message}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Toggle details could be added here, showing raw headers always for now */}
                <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">En-têtes bruts</h4>
                    <div className="text-xs font-mono text-gray-400 max-h-32 overflow-y-auto scrollbar-thin rounded bg-black/20 p-2">
                        {Object.entries(data.rawHeaders || {}).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                                <span className="text-blue-300 shrink-0">{k}:</span>
                                <span className="truncate opacity-70" title={String(v)}>{String(v)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusIcon({ status }: { status: string }) {
    if (status === 'present') return <Check className="h-4 w-4 text-green-500" />;
    if (status === 'missing') return <X className="h-4 w-4 text-red-500/70" />;
    if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return null;
}

function CardLoading({ title }: { title: string }) {
    return (
        <Card className="opacity-70 animate-pulse-slow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-20 bg-white/5 rounded-lg" />
            </CardContent>
        </Card>
    );
}

function CardError({ title, message }: { title: string; message: string }) {
    return (
        <Card className="border-red-500/30 bg-red-950/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-red-300">{message}</p>
            </CardContent>
        </Card>
    );
}
