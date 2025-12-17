import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Globe, CheckCircle2, AlertCircle } from "lucide-react";

interface DNSResultProps {
    data: any;
    loading: boolean;
    error: any;
}

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
                        <h4 className="font-semibold text-blue-300 text-sm mb-1">{type}</h4>
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
