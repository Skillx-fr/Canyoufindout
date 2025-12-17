# ReconSight 👁️

**Propulsé par [Skillx.fr](https://skillx.fr)**

Outil de reconnaissance passive moderne ("Passive Recon"), conçu pour être déployé sans serveur sur Vercel. ReconSight permet d'analyser rapidement un nom de domaine pour en extraire l'infrastructure, les informations de propriété et la présence sociale, le tout sans laisser de traces actives intrusives.

> **Version actuelle** : v0.1.1

## 🚀 Fonctionnalités & Modules

ReconSight repose sur une architecture modulaire **"Split & Fetch"**. Chaque module de scan est une API Serverless indépendante (`/api/scan/...`), ce qui permet de paralléliser les requêtes et de contourner les limites de temps d'exécution (Timeout 10s) des hébergements gratuits comme Vercel La structure du projet est organisée pour faciliter la maintenance et l'ajout de nouveaux scanners.

### 1. 📡 Module DNS (`/api/scan/dns`)
Ce module interroge les serveurs de noms pour récupérer l'infrastructure technique du domaine.
- **Bibliothèque** : Native Node.js `dns.promises`.
- **Enregistrements** :
    - `A` / `AAAA` : Adresse IP du serveur (IPv4/IPv6).
    - `MX` : Serveurs de messagerie (Mail Exchange).
    - `TXT` : Enregistrements textes (SPF, Verification tokens, etc.).
    - `NS` : Serveurs de noms autoritaires.

### 2. 👤 Module WHOIS (`/api/scan/whois`)
Récupère les informations publiques d'enregistrement du nom de domaine.
- **Bibliothèque** : `whoiser` (Client WHOIS universel).
- **Logique Avancée** : Intègre la bibliothèque `psl` (Public Suffix List) pour extraire intelligemment le domaine racine (eTLD+1).
    - *Exemple* : Si l'utilisateur scanne `platform.leakmited.com`, le module détecte automatiquement le domaine racine `leakmited.com` avant d'interroger le serveur WHOIS, car les sous-domaines n'ont pas d'enregistrements WHOIS propres.
- **Données** : Registrar, Dates (Création, Expiration), Statut du domaine.

### 3. 🛡️ Module Headers & Sécurité (`/api/scan/headers`)
Analyse les en-têtes HTTP de la page d'accueil pour évaluer la posture de sécurité.
- **Méthode** : Requête `HEAD` (rapide) ou `GET` (fallback).
- **Checks** :
    - **HSTS** (`Strict-Transport-Security`) : Force le HTTPS.
    - **CSP** (`Content-Security-Policy`) : Mitige les XSS.
    - **X-Frame-Options** : Prévient le Clickjacking.
    - **Server / X-Powered-By** : Détecte la divulgation de technologies (Information Disclosure).

### 4. 🌐 Module Social & Liens (`/api/scan/social`)
Effectue un scraping léger ("Light Scraping") du code HTML de la page d'accueil pour identifier l'empreinte numérique.
- **Extraction** : Regex optimisées pour détecter les liens vers les réseaux sociaux majeurs (Twitter/X, LinkedIn, Facebook, Instagram, GitHub, etc.).
- **Emails** : Tentative de détection d'adresses e-mail de contact publiques.

---

## 🛠️ Stack Technique

- **Frontend** : Next.js 15+ (App Router), React 19.
- **Styling** : Tailwind CSS v4 avec thème personnalisé **Skillx Glassmorphism** (Couleurs `#445dea` / `#0f1326`).
- **Backend** : Next.js API Routes (Edge/Node.js Runtimes).
- **Performance** : Gestion d'état asynchrone avec `Promise.allSettled`.

## 📦 Installation & Développement

Pour exécuter ReconSight localement ou contribuer :

1. **Cloner le dépôt officiel** :
   ```bash
   git clone https://github.com/Skillx-fr/Canyoufindout.git
   cd Canyoufindout
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## ⚠️ Avertissement Légal

**ReconSight** est un outil de reconnaissance **passive**. Il n'effectue aucune attaque, brute-force ou exploitation. Il ne fait que consolider des informations déjà publiques et accessibles à n'importe quel visiteur web.
L'utilisateur est seul responsable de l'usage qu'il en fait. Conçu pour les professionnels de la cybersécurité (Pentest, Bug Bounty) et les administrateurs systèmes.

---

*Développé avec ❤️ par l'équipe [Skillx.fr](https://skillx.fr).*
