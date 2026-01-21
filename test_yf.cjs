const yahooFinance = require('yahoo-finance2').default; // often default export in CJS is .default

(async () => {
    try {
        console.log('yf type:', typeof yahooFinance);
        if (yahooFinance) {
            const res = await yahooFinance.quote('TSLA');
            console.log(res);
        } else {
            console.log('yahooFinance is undefined');
            const pkg = require('yahoo-finance2');
            console.log('pkg:', pkg);
        }
    } catch (e) {
        console.error(e);
    }
})();
