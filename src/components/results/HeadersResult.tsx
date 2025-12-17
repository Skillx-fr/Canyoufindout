import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Shield, Check, X, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeadersResultProps {
    data: any;
    loading: boolean;
    error: any;
}

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
                    {data.securityAnalysis.map((check: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <StatusIcon status={check.status} />
                                <span className="text-sm font-medium text-gray-200">{check.header}</span>
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                                {check.status === 'present' ? <span className="text-green-400/80">Activé</span> : check.message}
                            </div>
                        </div>
                    ))}
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
