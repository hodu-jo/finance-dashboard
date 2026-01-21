import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

(async () => {
    try {
        console.log("Fetching VKOSPI (^VKOSPI) and USD/KRW (KRW=X)...");
        const results = await yahooFinance.quote(['^VKOSPI', 'KRW=X']);
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error("Error fetching quotes:", e.message);
    }
})();
