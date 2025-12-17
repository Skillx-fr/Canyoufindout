const whoiser = require('whoiser');

(async () => {
    try {
        console.log("Test WHOIS (whoisDomain) sur google.com...");
        // Utilisation explicite de whoisDomain
        const res = await whoiser.whoisDomain('google.com');

        // Structure top-level
        console.log('Keys:', Object.keys(res));

        // Premier résultat (souvent le registrar)
        const firstKey = Object.keys(res)[0];
        console.log('Sample Data for', firstKey, ':', res[firstKey]);

    } catch (err) {
        console.error("Erreur:", err);
    }
})();
