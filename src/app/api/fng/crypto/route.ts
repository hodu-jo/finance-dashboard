import { NextResponse } from 'next/server';
import axios from 'axios';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const response = await axios.get('https://api.alternative.me/fng/');

        // { name: "Fear and Greed Index", data: [ { value: "55", value_classification: "Greed", ... } ] }
        const data = response.data?.data?.[0];

        if (!data) {
            throw new Error('No data found');
        }

        return NextResponse.json({
            score: parseInt(data.value, 10),
            rating: data.value_classification,
            timestamp: data.timestamp
        });
    } catch (error) {
        console.error('Error fetching Crypto F&G:', error);
        return NextResponse.json({ error: 'Failed to fetch Crypto index' }, { status: 500 });
    }
}
