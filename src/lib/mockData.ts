
export const MOCK_STOCKS = {
    '^IXIC': { symbol: '^IXIC', shortName: 'NASDAQ', regularMarketPrice: 15310.97, regularMarketChange: 125.40, regularMarketChangePercent: 0.82, currency: 'USD' },
    '^KS11': { symbol: '^KS11', shortName: 'KOSPI', regularMarketPrice: 2450.65, regularMarketChange: -12.45, regularMarketChangePercent: -0.51, currency: 'KRW' },
    'BTC-USD': { symbol: 'BTC-USD', shortName: 'Bitcoin', regularMarketPrice: 42500.10, regularMarketChange: 850.20, regularMarketChangePercent: 2.04, currency: 'USD' },
    'ETH-USD': { symbol: 'ETH-USD', shortName: 'Ethereum', regularMarketPrice: 2350.45, regularMarketChange: 45.10, regularMarketChangePercent: 1.95, currency: 'USD' },
    'GC=F': { symbol: 'GC=F', shortName: 'Gold', regularMarketPrice: 2050.80, regularMarketChange: 15.20, regularMarketChangePercent: 0.75, currency: 'USD' },
    'KRW=X': { symbol: 'KRW=X', shortName: 'USD/KRW', regularMarketPrice: 1320.50, regularMarketChange: 2.50, regularMarketChangePercent: 0.19, currency: 'KRW' },
};

export const getMockStockData = (symbol: string) => {
    // Return predefined mock data or generic random data if unknown
    const mock = MOCK_STOCKS[symbol as keyof typeof MOCK_STOCKS];
    if (mock) {
        // Add tiny randomization so it feels alive
        const variance = (Math.random() - 0.5) * (mock.regularMarketPrice * 0.002); // 0.2% fluctuation
        return {
            ...mock,
            regularMarketPrice: mock.regularMarketPrice + variance,
            isMock: true // Flag to indicate mock data
        };
    }

    // Generic fallback for unknown symbols
    return {
        symbol,
        shortName: symbol,
        regularMarketPrice: 100.00,
        regularMarketChange: 0.50,
        regularMarketChangePercent: 0.50,
        currency: 'USD',
        isMock: true
    };
};

export const getMockHistory = (symbol: string) => {
    // Generate a random walk for sparkline
    const points = [];
    let price = MOCK_STOCKS[symbol as keyof typeof MOCK_STOCKS]?.regularMarketPrice || 100;
    const now = new Date();

    for (let i = 24 * 4; i >= 0; i--) { // 24 hours * 4 quarters
        // Random walk
        const change = (Math.random() - 0.5) * (price * 0.01);
        price += change;

        const date = new Date(now.getTime() - i * 15 * 60 * 1000); // 15 min intervals
        points.push({
            date: date.toISOString(),
            close: price
        });
    }

    return {
        symbol,
        quotes: points
    };
};
