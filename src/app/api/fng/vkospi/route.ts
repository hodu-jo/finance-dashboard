import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
    try {
        const response = await fetch('https://kr.investing.com/indices/kospi-volatility', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Investing.com returned status ${response.status}`);
        }

        const text = await response.text();
        const match = text.match(/data-test="instrument-price-last">([\d.]+)</);
        
        if (!match || !match[1]) {
            throw new Error('Could not parse VKOSPI price from HTML');
        }

        const score = parseFloat(match[1]);

        let rating = 'Normal';
        if (score < 10) rating = 'Stable (Greed)';
        else if (score >= 30) rating = 'Extreme Fear';
        else if (score >= 20) rating = 'Fear';

        return NextResponse.json({
            score: Number(score.toFixed(2)),
            rating,
            timestamp: new Date().toISOString(),
            label: 'KOSPI Volatility (VKOSPI)',
            description: 'Real-time VKOSPI from Investing.com'
        });
    } catch (error) {
        console.error('Error fetching VKOSPI:', error);
        return NextResponse.json({ error: 'Failed to fetch Volatility' }, { status: 500 });
    }
}
