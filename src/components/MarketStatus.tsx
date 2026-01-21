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
};

export default function MarketStatus() {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);

    // ^IXIC = NASDAQ, ^KS11 = KOSPI, BTC-USD, ETH-USD, GC=F = Gold Futures, KRW=X = USD/KRW
    useEffect(() => {
        const symbols = '^IXIC,^KS11,BTC-USD,ETH-USD,GC=F,KRW=X';

        // Fetch Quotes and History in parallel
        Promise.all([
            fetch(`/api/stocks?symbols=${symbols}`).then(res => res.json()),
            fetch(`/api/stocks/history?symbols=${symbols}`).then(res => res.json())
        ]).then(([quoteData, historyData]) => {
            // Merge data
            // historyData is an array of { symbol, quotes: [...] }
            const historyMap = new Map(historyData.map((h: any) => [h.symbol, h.quotes]));

            const merged = quoteData.map((q: any) => ({
                ...q,
                sparklineData: historyMap.get(q.symbol) || []
            }));

            // Custom ordering if needed, or rely on API return order (which we fixed in WatchList but not here, let's trust API or map)
            // Ideally we map to the symbols list order.
            const symbolOrder = symbols.split(',');
            const stockMap = new Map(merged.map((s: any) => [s.symbol, s]));
            const ordered = symbolOrder.map(s => stockMap.get(s)).filter(Boolean) as StockData[];

            setStocks(ordered);
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
            default: return `https://www.investing.com/search?q=${symbol}`;
        }
    };

    if (loading) return <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 animate-pulse h-64"></div>;

    return (
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-2 text-sm">📈</span>
                주요 지수 및 암호화폐 (24h)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock) => {
                    const isPositive = stock.regularMarketChange >= 0;
                    return (
                        <a
                            key={stock.symbol}
                            href={getInvestingUrl(stock.symbol)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{stock.shortName}</p>
                                    <p className="text-xs text-gray-400">{stock.symbol}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-900">
                                        {stock.regularMarketPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </p>
                                    <p className={`text-sm font-semibold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                                        {isPositive ? '▲' : '▼'} {Math.abs(stock.regularMarketChange).toFixed(2)} ({stock.regularMarketChangePercent.toFixed(2)}%)
                                    </p>
                                </div>
                            </div>
                            {/* Sparkline Chart Area */}
                            <div className="h-24 w-full mt-2">
                                {stock.sparklineData && stock.sparklineData.length > 0 ? (
                                    <Sparkline data={stock.sparklineData} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-300">차트 데이터 없음</div>
                                )}
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
