'use client';

import { useEffect, useState } from 'react';

type NewsItem = {
    title: string;
    link: string;
    pubDate: string;
    source: string;
};

type CategorizedNews = {
    worldPolitics: NewsItem[];
    economy: NewsItem[];
    tech: NewsItem[];
};

export default function NewsCard() {
    const [news, setNews] = useState<CategorizedNews | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<keyof CategorizedNews>('worldPolitics');

    useEffect(() => {
        fetch('/api/news')
            .then((res) => res.json())
            .then((data) => {
                setNews(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 animate-pulse h-64"></div>;

    const tabs: { key: keyof CategorizedNews; label: string }[] = [
        { key: 'worldPolitics', label: '국제 정세' },
        { key: 'economy', label: '경제' },
        { key: 'tech', label: '기술/IT' },
    ];

    const currentItems = news ? news[activeTab] : [];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full transition-colors duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-2 rounded-lg mr-2 text-sm">📰</span>
                주요 뉴스
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.key
                            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {currentItems && currentItems.length > 0 ? (
                    currentItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                        >
                            <h3 className="text-gray-900 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed">
                                {item.title}
                            </h3>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                                <span>{item.source}</span>
                                <span>{new Date(item.pubDate).toLocaleDateString('ko-KR')}</span>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">뉴스가 없습니다.</div>
                )}
            </div>
        </div>
    );
}
