import { YahooFinance } from 'yahoo-finance2'; // Try named first, if fails stick to default
// Wait, we learned earlier it's default export class
// Re-checking previous success: import YahooFinance from 'yahoo-finance2'; const yahooFinance = new YahooFinance();

import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

(async () => {
    try {
        console.log("Fetching 1-day chart with 15m interval for TSLA...");
        // queryOptions: { period1: ..., period2: ..., interval: '15m' } 
        // Or using 'chart' method if available
        // Let's try .chart() as it often supports '1d' range and '5m' interval
        const res = await yahooFinance.chart('TSLA', { period1: '1d', interval: '15m' });
        console.log("Result type:", typeof res);
        if (res && res.quotes && res.quotes.length > 0) {
            console.log("Quotes found:", res.quotes.length);
            console.log("First quote:", res.quotes[0]);
        } else {
            console.log("No quotes found or different structure", res);
        }
    } catch (e) {
        console.error("Error with .chart():", e.message);

        try {
            console.log("Trying .historical() with 1d...");
            // historical usually requires dates
            const queryOptions = { period1: '2026-01-20', interval: '1d' };
            // verifying if historical supports intraday is tricky without strictly controlled dates
            // Let's rely on .chart() which matches the "24h graph" need better
        } catch (e2) {
            console.error(e2);
        }
    }
})();
