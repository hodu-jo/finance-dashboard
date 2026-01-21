import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export const revalidate = 60; // Cache for 1 minute (stocks change often)

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
                console.error(`Failed to fetch ${symbol}:`, e);
                const message = e instanceof Error ? e.message : String(e);
                return { symbol, error: message };
            }
        });

        const quotesResults = await Promise.all(quotePromises);

        // Map to a simpler format
        const data = quotesResults.map((q) => {
            if ('error' in q && q.error) return q;
            // Cast to known type if successful, or check properties

            // Actually, let's just type the return of Promise.all above or cast q properly.
            // But to fix lint 'no-explicit-any', we can use 'unknown' and type guard, or just simple casting that satisfies lint.

            // Let's rely on the structure we know.
            const sQuote = q as Record<string, unknown>;
            if (sQuote.error) return sQuote;

            return {
                symbol: sQuote.symbol,
                shortName: sQuote.shortName || sQuote.longName || sQuote.symbol,
                regularMarketPrice: sQuote.regularMarketPrice,
                regularMarketChange: sQuote.regularMarketChange,
                regularMarketChangePercent: sQuote.regularMarketChangePercent,
                currency: sQuote.currency
            };
        });

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('Error fetching stocks:', error);
        const details = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: 'Failed to fetch stock data',
            details
        }, { status: 500 });
    }
}
