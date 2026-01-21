'use client';

import FearGreedCard from './FearGreedCard';

export default function SentimentPanel() {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 p-2 rounded-lg mr-2 text-sm">🧠</span>
                시장 심리 지수
            </h2>
            <div className="grid grid-cols-2 gap-4 h-full">
                <div className="col-span-1">
                    <FearGreedCard type="STOCK" />
                </div>
                <div className="col-span-1">
                    <FearGreedCard type="KOSPI" />
                </div>
                <div className="col-span-1">
                    <FearGreedCard type="CRYPTO" />
                </div>
                <div className="col-span-1">
                    <FearGreedCard type="GOLD" />
                </div>
            </div>
        </div>
    );
}
