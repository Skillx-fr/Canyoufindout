# ReconSight 👁️

Outil de reconnaissance passive moderne, conçu pour Vercel.
Scanner de domaine rapide, gratuit et sans inscription.

## Fonctionnalités

- **DNS** : Récupération des enregistrements A, AAAA, MX, TXT, NS.
- **WHOIS** : Informations sur le propriétaire et le registrar.
- **En-têtes de Sécurité** : Analyse de HSTS, CSP, X-Frame-Options, etc.
- **Social & Contacts** : Extraction des liens sociaux et e-mails publics depuis la page d'accueil.
- **Architecture "Split & Fetch"** : Contournement des timeouts Vercel grâce au chargement parallèle indépendant.
- **Rate Limit** : Protection basique (In-Memory) contre les abus.
- **Interface Premium** : Design "Glassmorphism" sombre, fluide et réactif.

## Installation Locale

1. Clonez le projet :
   ```bash
   git clone <votre-repo>
   cd reconsight
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

4. Ouvrez [http://localhost:3000](http://localhost:3000).

## Déploiement sur Vercel

Ce projet est optimisé pour Vercel (Serverless Functions). Aucune configuration complexe n'est requise.

1. Forkez ce dépôt.
2. Importez-le dans Vercel.
3. Le déploiement se lancera automatiquement.

L'architecture "Split & Fetch" assure que chaque scan (DNS, WHOIS, etc.) s'exécute dans sa propre fonction lambda, évitant ainsi le timeout global de 10s (Plan Gratuit) qui surviendrait si tout était séquentiel.

## Stack Technique

- **Frontend**: Next.js 15+ (App Router), React 19.
- **Styling**: Tailwind CSS v4.
- **Backend API**: Next.js API Routes.
- **Outils**: `whoiser`, `lru-cache`, `lucide-react`.

## Avertissement Légal

Cet outil est destiné à un usage éducatif et professionnel (Pentest, Bug Bounty, Audit). L'auteur décline toute responsabilité quant à l'utilisation malveillante de cet outil.
