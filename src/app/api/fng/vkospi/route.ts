import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

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
        console.warn('Investing.com scraping blocked/failed, falling back to Yahoo Finance HV calculation:', error);
        
        try {
            const period1 = new Date();
            period1.setDate(period1.getDate() - 45); // Fetch ~30 trading days
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = await yahooFinance.chart('^KS11', {
                period1: period1.toISOString(),
                interval: '1d'
            });
            
            if (!result || !result.quotes || result.quotes.length < 2) {
                return NextResponse.json({ error: 'Failed to fetch Yahoo fallback' }, { status: 500 });
            }
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const quotes = result.quotes.filter((q: any) => typeof q.close === 'number' && q.close > 0);
            const returns = [];
            for (let i = 1; i < quotes.length; i++) {
                const r = Math.log(quotes[i].close! / quotes[i - 1].close!);
                returns.push(r);
            }
            
            const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
            const hv = Math.sqrt(variance) * Math.sqrt(252) * 100;
            
            let rating = 'Normal';
            if (hv < 10) rating = 'Stable (Greed)';
            else if (hv >= 30) rating = 'Extreme Fear';
            else if (hv >= 20) rating = 'Fear';
            
            return NextResponse.json({
                score: Number(hv.toFixed(2)),
                rating,
                timestamp: new Date().toISOString(),
                label: 'KOSPI 공포지수 (HV 예상치)',
                description: '서버 차단 우회용 KOSPI 역사적 변동성(HV) 측정치'
            });

        } catch (fallbackError) {
            console.error('Fallback failed:', fallbackError);
            return NextResponse.json({ error: '데이터 수신 불가 (Connection Error)' }, { status: 500 });
        }
    }
}
