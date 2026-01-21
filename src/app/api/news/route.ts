import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const parser = new Parser();
        const feeds = {
            worldPolitics: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko',
            economy: [
                'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', // World Econ ID (using KR local for better context or user preference)
                'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko' // Generic Business (often KR heavy)
            ],
            tech: 'https://news.google.com/rss/topics/CAAqKAgKIiJDQkFTRXdvSkwyMHZNR1ptZHpWbUVnSnJieG9DUzFJb0FBUAE?hl=ko&gl=KR&ceid=KR:ko'
        };

        const results: Record<string, any[]> = {};

        await Promise.all(Object.entries(feeds).map(async ([key, sources]) => {
            try {
                let items: any[] = [];
                const urls = Array.isArray(sources) ? sources : [sources];

                for (const url of urls) {
                    try {
                        const feed = await parser.parseURL(url);
                        items = items.concat(feed.items);
                    } catch (e) {
                        console.error(`Failed to fetch sub-feed for ${key}:`, e);
                    }
                }

                // Deduplicate by link or title, sort by date desc
                const seen = new Set();
                items = items.filter(item => {
                    const duplicate = seen.has(item.link);
                    seen.add(item.link);
                    return !duplicate;
                });

                items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

                results[key] = items.slice(0, 5).map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source: item.creator || item.author || 'Google News'
                }));
            } catch (e) {
                console.error(`Failed to fetch ${key}:`, e);
                results[key] = [];
            }
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
