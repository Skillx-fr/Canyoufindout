import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Globe, CheckCircle2, AlertCircle } from "lucide-react";

interface DNSResultProps {
    data: any;
    loading: boolean;
    error: any;
}

import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";

// Définitions des tooltips DNS
const DNS_TOOLTIPS: Record<string, string> = {
    'A': 'Address Record. Associe un nom de domaine à une adresse IPv4 (ex: 192.168.1.1).',
    'AAAA': 'IPv6 Address Record. Associe un nom de domaine à une adresse IPv6 (ex: 2001:db8::1).',
    'MX': 'Mail Exchange Record. Indique les serveurs de messagerie responsables de la réception des emails pour ce domaine.',
    'TXT': 'Text Record. Permet d\'ajouter du texte arbitraire (souvent utilisé pour SPF, DKIM, ou validations de propriété Google/Microsoft).',
    'NS': 'Name Server Record. Indique quels serveurs DNS sont autoritaires et gèrent la zone de ce domaine.',
    'CNAME': 'Canonical Name Record. Alias pointant vers un autre nom de domaine.',
    'SOA': 'Start of Authority. Informations administratives sur la zone DNS (contact admin, délais de rafraîchissement...).',
};

export function DNSResult({ data, loading, error }: DNSResultProps) {
    if (loading) return <CardLoading title="DNS Records" />;
    if (error) return <CardError title="DNS Records" message={error} />;
    if (!data) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    Enregistrements DNS
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(data.records || {}).map(([type, records]: [string, any]) => (
                    <div key={type} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div className="mb-1">
                            <LabelWithTooltip
                                label={type}
                                tooltip={DNS_TOOLTIPS[type] || `Enregistrement DNS de type ${type}`}
                                className="text-blue-300 text-sm"
                            />
                        </div>
                        {records.length > 0 ? (
                            <ul className="space-y-1 text-sm text-gray-300">
                                {records.map((rec: any, idx: number) => (
                                    <li key={idx} className="font-mono break-all">
                                        {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-xs text-gray-500 italic">Aucun enregistrement</span>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// Composants internes pour Loading/Error
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
