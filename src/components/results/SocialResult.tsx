import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Share2, Mail, ExternalLink, AlertCircle } from "lucide-react";

interface SocialResultProps {
    data: any;
    loading: boolean;
    error: any;
}

export function SocialResult({ data, loading, error }: SocialResultProps) {
    if (loading) return <CardLoading title="Social & Contacts" />;
    if (error) return <CardError title="Social & Contacts" message={error} />;
    if (!data) return null;

    const socials = data.socials || [];
    const emails = data.emails || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-pink-400" />
                    Social & Contacts
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                        Réseaux Sociaux ({socials.length})
                    </h4>
                    {socials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {socials.map((link: string, idx: number) => (
                                <a
                                    key={idx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors truncate p-2 rounded bg-white/5 hover:bg-white/10"
                                >
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{link}</span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 italic">Aucun profil social détecté.</p>
                    )}
                </div>

                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                        E-mails trouvés ({emails.length})
                    </h4>
                    {emails.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {emails.map((email: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300 p-2 rounded bg-white/5">
                                    <Mail className="h-3 w-3 shrink-0 text-gray-500" />
                                    <span className="truncate select-all">{email}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 italic">Aucune adresse e-mail détectée.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
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
