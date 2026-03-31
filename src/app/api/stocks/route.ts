import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { getMockStockData } from '@/lib/mockData';

const yahooFinance = new YahooFinance();

export const revalidate = 10800; // Cache for 3 hours (User requested to minimize API hits)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
        return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').map(s => s.trim());

    try {
        // Fetch quotes in parallel
        const quotePromises = symbols.map(async (symbol) => {
            try {
                return await yahooFinance.quote(symbol);
            } catch (e: unknown) {
                console.warn(`Failed to fetch ${symbol} from API, using Mock Data:`, e);
                // FALLBACK: Return Mock Data
                return getMockStockData(symbol);
            }
        });

        const quotesResults = await Promise.all(quotePromises);

        // Map to a simpler format
        const data = quotesResults.map((q) => {
            if ('error' in q && q.error) return q;

            const sQuote = q as Record<string, unknown>;
            if (sQuote.error) return sQuote;

            return {
                symbol: sQuote.symbol,
                shortName: sQuote.shortName || sQuote.longName || sQuote.symbol,
                regularMarketPrice: sQuote.regularMarketPrice,
                regularMarketChange: sQuote.regularMarketChange,
                regularMarketChangePercent: sQuote.regularMarketChangePercent,
                currency: sQuote.currency,
                isMock: !!sQuote.isMock // Pass mock flag for UI
            };
        });

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('Error fetching stocks:', error);
        // Fallback for global failure
        const mockData = symbols.map(s => getMockStockData(s));
        return NextResponse.json(mockData);
    }
}
