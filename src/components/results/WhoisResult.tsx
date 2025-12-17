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
    if (!whoisData) return null;

    // On cherche les clés qui contiennent des données pertinentes (souvent le nom de domaine DNS)
    // On priorise les objets qui ont 'Registrar', ou on merge tout.
    let mergedData: any = {};
    const keys = Object.keys(whoisData);

    for (const key of keys) {
        const record = whoisData[key];
        if (typeof record === 'object' && record !== null) {
            // On merge les champs intéressants
            mergedData = { ...mergedData, ...record };
        }
    }

    // Nettoyage des clés redondantes ou techniques
    if (Object.keys(mergedData).length === 0) return null;

    return {
        'Registrar': mergedData['Registrar'] || mergedData['registrar'],
        'Updated Date': mergedData['Updated Date'] || mergedData['updatedDate'],
        'Creation Date': mergedData['Created Date'] || mergedData['createdDate'] || mergedData['Creation Date'],
        'Registry Expiry Date': mergedData['Registry Expiry Date'] || mergedData['registryExpiryDate'] || mergedData['Expiry Date'],
        'Organization': mergedData['Registrant Organization'] || mergedData['registrantOrganization'] || 'Masqué',
        'Name Servers': mergedData['Name Server'] || mergedData['nameServer'],
        'Status': mergedData['Domain Status'] || mergedData['domainStatus']
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
