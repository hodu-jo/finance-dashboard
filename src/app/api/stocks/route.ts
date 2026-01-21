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
            } catch (e: any) {
                console.error(`Failed to fetch ${symbol}:`, e);
                return { symbol, error: e.message || String(e) };
            }
        });

        const quotesResults = await Promise.all(quotePromises);

        // Map to a simpler format
        const data = quotesResults.map((q: any) => {
            if (q.error) return q;
            return {
                symbol: q.symbol,
                shortName: q.shortName || q.longName || q.symbol,
                regularMarketPrice: q.regularMarketPrice,
                regularMarketChange: q.regularMarketChange,
                regularMarketChangePercent: q.regularMarketChangePercent,
                currency: q.currency
            };
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching stocks:', error);
        return NextResponse.json({
            error: 'Failed to fetch stock data',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
