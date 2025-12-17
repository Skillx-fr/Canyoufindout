'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Radar } from 'lucide-react';
import { DNSResult } from '@/components/results/DNSResult';
import { WhoisResult } from '@/components/results/WhoisResult';
import { HeadersResult } from '@/components/results/HeadersResult';
import { SocialResult } from '@/components/results/SocialResult';
import { normalizeUrl } from '@/lib/utils';

type ScanStatus = 'idle' | 'loading' | 'complete' | 'error';

interface ScanState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const initialScanState = { data: null, loading: false, error: null };

export default function Home() {
  const [url, setUrl] = useState('');
  const [globalStatus, setGlobalStatus] = useState<ScanStatus>('idle');

  const [dns, setDns] = useState<ScanState<any>>(initialScanState);
  const [whois, setWhois] = useState<ScanState<any>>(initialScanState);
  const [headers, setHeaders] = useState<ScanState<any>>(initialScanState);
  const [social, setSocial] = useState<ScanState<any>>(initialScanState);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Reset states
    setGlobalStatus('loading');
    setDns({ ...initialScanState, loading: true });
    setWhois({ ...initialScanState, loading: true });
    setHeaders({ ...initialScanState, loading: true });
    setSocial({ ...initialScanState, loading: true });

    const targetUrl = normalizeUrl(url);

    // Fonction générique pour fetcher chaque endpoint indépendamment
    const runScan = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<ScanState<any>>>) => {
      try {
        const res = await fetch(`/api/scan/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Erreur ${res.status}`);
        }

        setter({ data, loading: false, error: null });
      } catch (err: any) {
        setter({ data: null, loading: false, error: err.message || 'Erreur inconnue' });
      }
    };

    // Lancement parallèle ("Fire and Forget" pour l'UI, mais on attend tout pour le statut global)
    Promise.allSettled([
      runScan('dns', setDns),
      runScan('whois', setWhois),
      runScan('headers', setHeaders),
      runScan('social', setSocial)
    ]).then(() => {
      setGlobalStatus('complete');
    });
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      {/* Header Héroïque */}
      <div className="text-center space-y-6 pt-12 md:pt-20">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-[#445dea]/10 border border-[#445dea]/20 shadow-[0_0_50px_-10px_rgba(68,93,234,0.3)] animate-pulse-slow">
            <Radar className="w-16 h-16 text-[#445dea]" />
          </div>
        </div>
        <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#445dea] via-purple-400 to-pink-400 tracking-tight">
          ReconSight
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg md:text-xl font-light">
          Plateforme de reconnaissance passive instantanée. <br />
          Analysez n'importe quel domaine sans laisser de traces.
        </p>
      </div>

      {/* Barre de Recherche Flottante */}
      <div className="max-w-2xl mx-auto sticky top-6 z-20 backdrop-blur-xl rounded-2xl p-1 shadow-2xl shadow-black/50">
        <form onSubmit={handleScan} className="relative flex items-center">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="exemple.com ou https://site.com"
            className="h-16 pl-6 pr-36 text-lg rounded-xl border-white/10 bg-black/60 focus:ring-[#445dea]/40 focus:border-[#445dea]/40"
          />
          <Button
            type="submit"
            disabled={globalStatus === 'loading' || !url}
            className="absolute right-2 h-12 px-8 rounded-lg bg-[#445dea] hover:bg-[#3b50ce] text-white font-semibold shadow-lg shadow-[#445dea]/20 transition-all"
          >
            {globalStatus === 'loading' ? 'Scan...' : 'Scanner'}
          </Button>
        </form>
      </div>

      {/* Grille de Résultats */}
      {(globalStatus !== 'idle' || dns.loading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Colonne Gauche: Infrastructure */}
          <div className="space-y-6">
            <DNSResult {...dns} />
            <WhoisResult {...whois} />
          </div>

          {/* Colonne Droite: Sécurité & App */}
          <div className="space-y-6">
            <HeadersResult {...headers} />
            <SocialResult {...social} />
          </div>
        </div>
      )}

      {/* Footer Version */}
      <footer className="fixed bottom-0 left-0 w-full p-3 text-center text-xs text-gray-500 bg-black/60 backdrop-blur-md border-t border-white/5 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
        <span>
          Propulsé par <a href="https://skillx.fr" target="_blank" rel="noopener noreferrer" className="text-[#445dea] hover:text-[#5b73ff] font-medium transition-colors">Skillx.fr</a>
        </span>
        <span className="hidden md:inline">•</span>
        <span>
          Code Source sur <a href="https://github.com/Skillx-fr/Canyoufindout" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-white/20 hover:decoration-white/50">GitHub</a>
        </span>
        <span className="hidden md:inline">•</span>
        <span className="opacity-60">v0.1.1</span>
      </footer>
    </main>
  );
}
