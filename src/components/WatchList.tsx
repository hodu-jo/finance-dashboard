'use client';

import { useEffect, useState } from 'react';

type StockData = {
    symbol: string;
    shortName: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    currency: string;
    error?: string;
};

export default function WatchList() {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [symbols, setSymbols] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Default watchlist
    const defaultSymbols = ['TSLA', 'NVDA', 'AAPL', '005930.KS', '035420.KS'];

    // Load from local storage on mount
    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem('myWatchlist');
        if (saved) {
            try {
                setSymbols(JSON.parse(saved));
            } catch (e) {
                setSymbols(defaultSymbols);
            }
        } else {
            setSymbols(defaultSymbols);
        }
    }, []);

    // Save to local storage whenever symbols change
    useEffect(() => {
        if (isClient) {
            localStorage.setItem('myWatchlist', JSON.stringify(symbols));
        }
    }, [symbols, isClient]);

    // Fetch data whenever symbols change
    useEffect(() => {
        if (symbols.length === 0) {
            setStocks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const symbolsParam = symbols.join(',');
        fetch(`/api/stocks?symbols=${symbolsParam}`)
            .then((res) => res.json())
            .then((data) => {
                // Maintain order of symbols
                const stockMap = new Map((data as StockData[]).map((s) => [s.symbol, s]));
                const orderedStocks = symbols.map(sym => stockMap.get(sym) || {
                    symbol: sym,
                    shortName: sym,
                    regularMarketPrice: 0,
                    regularMarketChange: 0,
                    regularMarketChangePercent: 0,
                    currency: '-',
                    error: 'Not Found'
                });
                setStocks(orderedStocks);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [symbols]);

    const addSymbol = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanSymbol = inputValue.trim().toUpperCase();
        if (!cleanSymbol) return;
        if (symbols.includes(cleanSymbol)) {
            alert('이미 목록에 있는 종목입니다.');
            return;
        }
        setSymbols([...symbols, cleanSymbol]);
        setInputValue('');
    };

    const removeSymbol = (symbolToRemove: string) => {
        if (confirm(`${symbolToRemove} 종목을 삭제하시겠습니까?`)) {
            setSymbols(symbols.filter(s => s !== symbolToRemove));
        }
    };

    if (!isClient) return <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 h-64"></div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg mr-2 text-sm">⭐</span>
                    관심 종목
                </h2>
            </div>

            <form onSubmit={addSymbol} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="종목코드 (예: GOOGL, 005930.KS)"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                    type="submit"
                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors"
                >
                    +
                </button>
            </form>

            {loading && symbols.length > 0 && stocks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">로딩중...</div>
            ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto max-h-[400px]">
                    {stocks.map((stock) => {
                        const isPositive = stock.regularMarketChange >= 0;
                        const isError = !!stock.error;

                        return (
                            <div key={stock.symbol} className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 transition-colors group">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <button
                                        onClick={() => removeSymbol(stock.symbol)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="삭제"
                                    >
                                        ✕
                                    </button>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 truncate">{stock.shortName}</p>
                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{stock.symbol}</span>
                                    </div>
                                </div>

                                <div className="text-right whitespace-nowrap">
                                    {isError ? (
                                        <span className="text-xs text-red-400">조회 실패</span>
                                    ) : (
                                        <>
                                            <div className="font-semibold text-gray-900">
                                                {stock.regularMarketPrice.toLocaleString()} {stock.currency}
                                            </div>
                                            <div className={`text-xs font-bold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                                                {isPositive ? '+' : ''}{stock.regularMarketChangePercent?.toFixed(2)}%
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {symbols.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            종목이 없습니다.<br />위 입력창에서 추가해주세요.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
