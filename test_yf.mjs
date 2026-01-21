import yahooFinance from 'yahoo-finance2';
(async () => {
    try {
        const res = await yahooFinance.quote('TSLA');
        console.log(res);
    } catch (e) {
        console.error(e);
    }
})();
