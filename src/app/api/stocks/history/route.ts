import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
        return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').map(s => s.trim());
    const period1 = new Date();
    period1.setDate(period1.getDate() - 1); // 24h ago

    try {
        const promises = symbols.map(async (symbol) => {
            try {
                const result = await yahooFinance.chart(symbol, {
                    period1: period1.toISOString(),
                    interval: '15m' // 15 minute intervals for better granularity
                });

                if (!result || !result.quotes || result.quotes.length === 0) {
                    return { symbol, error: 'No data' };
                }

                const validQuotes = result.quotes.filter(q => typeof q.close === 'number' && q.close > 0);

                return {
                    symbol,
                    quotes: validQuotes.map(q => ({
                        date: q.date,
                        close: q.close
                    }))
                };
            } catch (e: any) {
                console.error(`Failed to fetch history for ${symbol}:`, e);
                return { symbol, error: e.message || String(e) };
            }
        });

        const results = await Promise.all(promises);
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error fetching stock history:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
