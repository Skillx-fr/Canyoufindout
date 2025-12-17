import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Fingerprint, AlertCircle } from "lucide-react";

interface WhoisResultProps {
    data: any;
    loading: boolean;
    error: any;
}

export function WhoisResult({ data, loading, error }: WhoisResultProps) {
    if (loading) return <CardLoading title="WHOIS Info" />;
    if (error) return <CardError title="WHOIS Info" message={error} />;
    if (!data) return null;

    // Extraction simplifiée des données pertinentes
    const displayData = extractWhoisData(data.data);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-purple-400" />
                    Informations WHOIS
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                {displayData ? (
                    <div className="grid grid-cols-1 gap-2 text-sm">
                        {Object.entries(displayData).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-400">{key}:</span>
                                <span className="text-gray-200 font-mono text-right">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">
                        {JSON.stringify(data.data, null, 2)}
                    </pre>
                )}
            </CardContent>
        </Card>
    );
}

function extractWhoisData(whoisData: any) {
    // Tentative d'extraire les champs communs de whoiser
    if (!whoisData) return null;

    // On cherche le premier objet qui ressemble à des données de registrar
    const relevantKeys = Object.keys(whoisData).filter(k => k.includes('.'));
    if (relevantKeys.length === 0) return null; // Pas de TLD match ?

    const record = whoisData[relevantKeys[0]];

    return {
        'Registrar': record['Registrar'] || record['registrar'],
        'Updated Date': record['Updated Date'] || record['updatedDate'],
        'Creation Date': record['Creation Date'] || record['creationDate'],
        'Registry Expiry Date': record['Registry Expiry Date'] || record['registryExpiryDate'],
        'Organization': record['Registrant Organization'] || record['registrantOrganization'] || 'Masqué',
    };
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
