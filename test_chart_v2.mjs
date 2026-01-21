import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

(async () => {
    try {
        console.log("Fetching 1-day chart with 15m interval for TSLA...");
        const period1 = new Date();
        period1.setDate(period1.getDate() - 1); // Yesterday
        const queryOptions = { period1: period1.toISOString(), interval: '30m' };
        // Note: interval '15m' might require shorter ranges or specific permissions, '30m' or '1h' is safer for free tier sometimes, but let's try 15m or 30m.
        console.log("Querying with:", queryOptions);
        const res = await yahooFinance.chart('TSLA', queryOptions);

        // Sometimes it's better to pass range: '1d' instead of period1/period2 for relative ranges
        // But the library types might prefer range.
        // Let's print invalid options error if it happens to see what's allowed.

        if (res && res.quotes && res.quotes.length > 0) {
            console.log("Quotes found:", res.quotes.length);
            console.log("First quote:", res.quotes[0]);
            console.log("Last quote:", res.quotes[res.quotes.length - 1]);
        } else {
            console.log("No quotes found or different structure", res);
        }
    } catch (e) {
        console.error("Error with .chart():", e.message);
    }
})();
