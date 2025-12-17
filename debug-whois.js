const whoiserLib = require('whoiser');
// Gestion hybride CJS/ESM
const whoiser = whoiserLib.default || whoiserLib;

console.log('Type of whoiser:', typeof whoiser);
console.log('Keys:', Object.keys(whoiserLib));

(async () => {
    if (typeof whoiser !== 'function') {
        console.error('Whoiser n\'est pas une fonction. Export:', whoiserLib);
        return;
    }

    try {
        console.log("Test WHOIS sur google.com...");
        const res = await whoiser('google.com');
        // console.log(JSON.stringify(res, null, 2));

        // Log des clés de premier niveau pour comprendre la structure
        console.log('Top level keys:', Object.keys(res));

        // Affiche un exemple de record
        const firstKey = Object.keys(res)[0];
        console.log('Data for', firstKey, ':', res[firstKey]);

    } catch (err) {
        console.error("Erreur:", err);
    }
})();
