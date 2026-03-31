'use client';

import { useEffect, useState } from 'react';
import Sparkline from './Sparkline';

type StockData = {
    symbol: string;
    shortName: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    currency: string;
    sparklineData?: { date: string; close: number }[];
    error?: string;
    isMock?: boolean;
};

interface HistoryResponse {
    symbol: string;
    quotes: { date: string; close: number }[];
}

export default function MarketStatus() {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // ^IXIC = NASDAQ, ^KS11 = KOSPI, BTC-USD, ETH-USD, GC=F = Gold Futures, KRW=X = USD/KRW, DX-Y.NYB = US Dollar Index
    useEffect(() => {
        const symbols = '^IXIC,^KS11,BTC-USD,ETH-USD,GC=F,KRW=X,DX-Y.NYB';

        // Fetch Quotes and History in parallel
        Promise.all([
            fetch(`/api/stocks?symbols=${symbols}`).then(res => res.json()),
            fetch(`/api/stocks/history?symbols=${symbols}`).then(res => res.json())
        ]).then(([quoteData, historyData]: [StockData[], HistoryResponse[]]) => {
            // Merge data
            // historyData is an array of { symbol, quotes: [...] }
            const historyMap = new Map(historyData.map((h) => [h.symbol, h.quotes]));

            const merged = quoteData.map((q) => ({
                ...q,
                sparklineData: historyMap.get(q.symbol) || []
            }));

            // Custom ordering
            const symbolOrder = symbols.split(',');
            const stockMap = new Map(merged.map((s) => [s.symbol, s]));
            const ordered = symbolOrder.map(s => stockMap.get(s)).filter((s) => s !== undefined) as StockData[];

            setStocks(ordered);

            // Calculate bucketed time (every 3 hours: 0, 3, 6, 9, 12, 15, 18, 21)
            const now = new Date();
            const hours = now.getHours();
            const bucketHour = Math.floor(hours / 3) * 3;
            const ampm = bucketHour >= 12 ? 'PM' : 'AM';
            const displayHour = bucketHour % 12 || 12;
            const bucketTimeStr = `${displayHour}:00:00 ${ampm}`;

            setLastUpdated(bucketTimeStr);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const getInvestingUrl = (symbol: string) => {
        switch (symbol) {
            case '^IXIC': return 'https://www.investing.com/indices/nasdaq-composite';
            case '^KS11': return 'https://www.investing.com/indices/kospi';
            case 'BTC-USD': return 'https://www.investing.com/crypto/bitcoin/btc-usd';
            case 'ETH-USD': return 'https://www.investing.com/crypto/ethereum/eth-usd';
            case 'GC=F': return 'https://www.investing.com/commodities/gold';
            case 'KRW=X': return 'https://www.investing.com/currencies/usd-krw';
            case 'DX-Y.NYB': return 'https://www.investing.com/indices/usdollar';
            default: return `https://www.investing.com/search?q=${symbol}`;
        }
    };

    if (loading) return <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 animate-pulse h-64"></div>;

    const hasAnyMock = stocks.some(s => s.isMock);

    return (
        <div className="col-span-1 md:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg mr-2 text-sm">📈</span>
                    주요 지수 및 암호화폐 (24h)
                </h2>
                <div className="flex items-center gap-2">
                    {hasAnyMock && (
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-200 dark:border-amber-800/50">
                            DEMO DATA
                        </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock) => {
                    // Check for error state or missing data
                    if (stock.error || typeof stock.regularMarketPrice !== 'number') {
                        return (
                            <div
                                key={stock.symbol}
                                className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-red-100 dark:border-red-900/30"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-bold text-gray-700 dark:text-gray-200">{stock.symbol}</p>
                                        <p className="text-xs text-red-500 dark:text-red-400">데이터 조회 실패</p>
                                    </div>
                                </div>
                                <div className="h-24 w-full mt-2 flex items-center justify-center text-xs text-gray-400">
                                    N/A
                                </div>
                            </div>
                        );
                    }

                    const isPositive = stock.regularMarketChange >= 0;
                    return (
                        <div
                            key={stock.symbol}
                            className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative border border-transparent dark:border-gray-600"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-bold text-gray-700 dark:text-gray-200">{stock.shortName}</p>
                                        {stock.isMock && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Demo Data"></span>}
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{stock.symbol}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                                        {stock.regularMarketPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </p>
                                    <p className={`text-sm font-semibold ${isPositive ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                                        {isPositive ? '▲' : '▼'} {Math.abs(stock.regularMarketChange).toFixed(2)} ({stock.regularMarketChangePercent.toFixed(2)}%)
                                    </p>
                                </div>
                            </div>
                            {/* Sparkline Chart Area */}
                            <div className="h-24 w-full mt-2">
                                {stock.sparklineData && stock.sparklineData.length > 0 ? (
                                    <Sparkline data={stock.sparklineData} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-300 dark:text-gray-600">차트 데이터 없음</div>
                                )}
                            </div>

                            {/* Source Link Footer */}
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-right">
                                <a
                                    href={getInvestingUrl(stock.symbol)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1 transition-colors"
                                >
                                    Source: Investing.com ↗
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
