import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export const revalidate = 3600; // Cache for 1 hour

function calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate subsequent RSI
    for (let i = period + 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? Math.abs(diff) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

export async function GET() {
    try {
        // Fetch 30 days of data to have enough for 14-day RSI
        // Use historical data for GC=F
        const period1 = new Date();
        period1.setDate(period1.getDate() - 60);

        const result = await yahooFinance.chart('GC=F', {
            period1: period1.toISOString(),
            interval: '1d'
        });

        if (!result || !result.quotes || result.quotes.length < 15) {
            throw new Error('Not enough data for RSI');
        }

        const closes = result.quotes.map(q => q.close).filter(c => typeof c === 'number') as number[];

        const rsi = calculateRSI(closes);

        // Mapping RSI to Fear & Greed terms
        // RSI > 70: Overbought (Extreme Greed)
        // RSI > 60: Greed
        // RSI < 30: Oversold (Extreme Fear)
        // RSI < 40: Fear
        // Else: Neutral

        let rating = 'Neutral';
        if (rsi >= 70) rating = 'Extreme Greed';
        else if (rsi >= 60) rating = 'Greed';
        else if (rsi <= 30) rating = 'Extreme Fear';
        else if (rsi <= 40) rating = 'Fear';

        // Normalize score to look like 0-100 index but actually it is 0-100 RSI
        // Maybe we just return RSI directly. User requested "RSI" if F&G is hard.

        return NextResponse.json({
            score: rsi,
            rating: rating,
            timestamp: new Date().toISOString(),
            label: 'RSI (14D)'
        });
    } catch (error) {
        console.error('Error fetching Gold RSI:', error);
        return NextResponse.json({ error: 'Failed to fetch Gold index' }, { status: 500 });
    }
}
