import { NextResponse } from 'next/server';
import axios from 'axios';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        // Official CNN endpoint often blocks requests without a browser-like User-Agent
        const response = await axios.get('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        // The data format usually contains a 'fear_and_greed' object with 'score' and 'rating'
        const data = response.data;

        // Check if the structure matches what we expect
        const fngData = data.fear_and_greed || {};

        return NextResponse.json({
            score: fngData.score || 0,
            rating: fngData.rating || 'Unknown',
            timestamp: fngData.timestamp
        });
    } catch (error) {
        console.error('Error fetching CNN F&G:', error);
        // Fallback or error return. 
        // Sometimes accessing via RapidAPI is better, but let's try direct first.
        return NextResponse.json({ error: 'Failed to fetch CNN index' }, { status: 500 });
    }
}
