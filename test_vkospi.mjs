import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

(async () => {
    const symbols = ['KRW=X', 'GC=F'];
    const period1 = new Date();
    period1.setDate(period1.getDate() - 1);

    for (const symbol of symbols) {
        try {
            const result = await yahooFinance.chart(symbol, {
                period1: period1.toISOString(),
                interval: '15m'
            });
            const quotes = result.quotes.filter(q => q.close).map(q => q.close);
            const min = Math.min(...quotes);
            const max = Math.max(...quotes);
            console.log(`${symbol}: Count=${quotes.length} Min=${min} Max=${max} Range=${max - min}`);
            console.log(`First 5: ${quotes.slice(0, 5).join(', ')}`);
        } catch (e) {
            console.log(e);
        }
    }
})();
