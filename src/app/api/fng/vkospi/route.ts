import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export const revalidate = 3600;

export async function GET() {
    try {
        // Strategy: Try to fetch ^VKOSPI. If it fails (likely), calculate Historical Volatility (HV) from KOSPI (^KS11).
        // VKOSPI is Implied Volatility (IV), but HV is a good proxy for "Fear" (Turbulence).

        // 1. Fetch KOSPI history for 1 year (approx 252 trading days) to calculate annualized vol
        const period1 = new Date();
        period1.setDate(period1.getDate() - 45); // Fetch last 45 days to be safe for 30-day window

        const result = await yahooFinance.chart('^KS11', {
            period1: period1.toISOString(),
            interval: '1d'
        });

        if (!result || !result.quotes || result.quotes.length < 22) {
            throw new Error('Not enough data for KOSPI Volatility');
        }

        // Filter valid closes
        const closes = result.quotes.map(q => q.close).filter(c => typeof c === 'number') as number[];

        // Calculate Log Returns
        const logReturns = [];
        for (let i = 1; i < closes.length; i++) {
            logReturns.push(Math.log(closes[i] / closes[i - 1]));
        }

        // Use last 20 days (approx 1 month trading) for short-term "Fear"
        const windowSize = 20;
        const recentReturns = logReturns.slice(-windowSize);

        // Calculate Standard Deviation
        const mean = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
        const variance = recentReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (recentReturns.length - 1);
        const stdDev = Math.sqrt(variance);

        // Annualize (multiply by sqrt(252))
        const annualizedVol = stdDev * Math.sqrt(252) * 100;

        const score = annualizedVol;

        // Rating Logic based on KOSPI HV (General rule of thumb for indices)
        // Low (< 10): Complacency / Extreme Greed
        // Normal (10-20): Normal
        // High (20-30): Fear
        // Extreme (> 30): Extreme Fear

        let rating = 'Normal';
        if (score < 10) rating = 'Stable (Greed)';
        else if (score >= 30) rating = 'Extreme Fear';
        else if (score >= 20) rating = 'Fear';

        return NextResponse.json({
            score: Number(score.toFixed(2)),
            rating,
            timestamp: new Date().toISOString(),
            label: 'KOSPI HV (20D)',
            description: 'Historical Volatility (20-day annualized)'
        });
    } catch (error) {
        console.error('Error fetching VKOSPI:', error);
        // Return a safe fallback or error
        return NextResponse.json({ error: 'Failed to fetch Volatility' }, { status: 500 });
    }
}
