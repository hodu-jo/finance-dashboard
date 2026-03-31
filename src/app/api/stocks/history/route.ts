import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { getMockHistory } from '@/lib/mockData';

const yahooFinance = new YahooFinance();

export const revalidate = 10800; // Cache for 3 hours

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
                    // Try mock fallback if data is empty
                    console.warn(`Empty history for ${symbol}, using Mock`);
                    return getMockHistory(symbol);
                }

                const validQuotes = result.quotes.filter(q => typeof q.close === 'number' && q.close > 0);

                return {
                    symbol,
                    quotes: validQuotes.map(q => ({
                        date: q.date,
                        close: q.close
                    }))
                };
            } catch (e: unknown) {
                console.warn(`Failed to fetch history for ${symbol}, using Mock:`, e);
                // FALLBACK
                return getMockHistory(symbol);
            }
        });

        const results = await Promise.all(promises);
        return NextResponse.json(results);
    } catch (error: unknown) {
        console.error('Error fetching stock history:', error);
        // Fallback for global failure
        const mockData = symbols.map(s => getMockHistory(s));
        return NextResponse.json(mockData);
    }
}
