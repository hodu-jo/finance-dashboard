'use client';

import { useEffect, useState } from 'react';

type FnGData = {
    score: number;
    rating: string;
    timestamp?: string;
    label?: string;
};

export default function FearGreedCard({ type }: { type: 'STOCK' | 'CRYPTO' | 'GOLD' | 'KOSPI' }) {
    const [data, setData] = useState<FnGData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        let endpoint = '';
        if (type === 'STOCK') endpoint = '/api/fng/cnn';
        else if (type === 'CRYPTO') endpoint = '/api/fng/crypto';
        else if (type === 'GOLD') endpoint = '/api/fng/gold';
        else if (type === 'KOSPI') endpoint = '/api/fng/vkospi';

        // eslint-disable-next-line
        setLoading(true);
        setError(false);

        fetch(endpoint)
            .then((res) => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    }, [type]);

    const getColor = (score: number) => {
        // RSI Logic (Gold)
        if (type === 'GOLD') {
            if (score >= 70) return 'text-red-500 bg-red-50'; // Overbought
            if (score >= 60) return 'text-orange-500 bg-orange-50';
            if (score <= 30) return 'text-green-600 bg-green-100'; // Oversold
            if (score <= 40) return 'text-blue-500 bg-blue-50';
            return 'text-gray-600 bg-gray-100';
        }

        // VKOSPI Logic (High is bad/fear)
        if (type === 'KOSPI') {
            if (score >= 30) return 'text-red-600 bg-red-100'; // Extreme Fear
            if (score >= 20) return 'text-orange-500 bg-orange-50'; // Fear
            if (score >= 10) return 'text-blue-500 bg-blue-50'; // Normal
            return 'text-green-600 bg-green-100'; // Stable
        }

        // Fear & Greed Logic (Stock/Crypto)
        if (score >= 75) return 'text-green-600 bg-green-100'; // Extreme Greed
        if (score >= 55) return 'text-green-500 bg-green-50'; // Greed
        if (score >= 45) return 'text-gray-600 bg-gray-100';   // Neutral
        if (score >= 25) return 'text-red-500 bg-red-50';      // Fear
        return 'text-red-600 bg-red-100';                      // Extreme Fear
    };

    if (loading) return <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 animate-pulse h-40"></div>;

    if (error) {
        return (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center h-full relative overflow-hidden">
                <h2 className="text-gray-400 text-xs font-semibold tracking-wider mb-2 uppercase">
                    {getTypeTitle(type)}
                </h2>
                <div className="text-gray-400 font-bold text-sm mb-2 text-center">
                    데이터 수신 불가
                </div>
                <div className="px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-500">
                    Connection Error
                </div>
            </div>
        );
    }

    const colorClass = data ? getColor(data.score) : 'text-gray-400';
    const displayScore = data ? Math.round(data.score) : '-';

    let title = getTypeTitle(type);
    let infoTitle = 'Fear & Greed Index';
    let infoDesc = '0에 가까울수록 공포(매수 기회), 100에 가까울수록 탐욕(매도 고려)을 의미합니다.';
    let ranges = [
        { label: 'Extreme Greed', range: '75-100', desc: '강한 매수세 (조심)' },
        { label: 'Greed', range: '55-75', desc: '매수세 우위' },
        { label: 'Neutral', range: '45-55', desc: '중립' },
        { label: 'Fear', range: '25-45', desc: '매도세 우위' },
        { label: 'Extreme Fear', range: '0-25', desc: '강한 공포 (기회?)' },
    ];
    let sourceName = 'CNN Business';
    let sourceUrl = 'https://edition.cnn.com/markets/fear-and-greed';

    if (type === 'CRYPTO') {
        title = '가상화폐 심리';
        sourceName = 'Alternative.me';
        sourceUrl = 'https://alternative.me/crypto/fear-and-greed-index/';
    }

    if (type === 'GOLD') {
        title = '금 RSI (14D)';
        infoTitle = 'Relative Strength Index';
        infoDesc = '상대강도지수(RSI)는 가격의 상승/하락 압력을 측정합니다.';
        ranges = [
            { label: 'Overbought', range: '70-100', desc: '과매수 (조정 가능성)' },
            { label: 'Neutral', range: '30-70', desc: '일반적 변동' },
            { label: 'Oversold', range: '0-30', desc: '과매도 (반등 가능성)' },
        ];
        sourceName = 'Yahoo Finance (GC=F)';
        sourceUrl = 'https://finance.yahoo.com/quote/GC=F';
    }

    if (type === 'KOSPI') {
        title = 'KOSPI 공포지수 (HV)';
        infoTitle = 'Historical Volatility (20D)';
        infoDesc = '코스피의 20일 역사적 변동성을 연환산한 수치입니다. 변동성이 클수록 공포가 심함을 의미합니다.';
        ranges = [
            { label: 'Extreme Fear', range: '> 30', desc: '극심한 공포/변동성' },
            { label: 'Fear', range: '20-30', desc: '공포/불안정' },
            { label: 'Normal', range: '10-20', desc: '일반적인 시장' },
            { label: 'Stable', range: '< 10', desc: '안정/낙관 (탐욕)' },
        ];
        sourceName = 'Calculated from Yahoo Finance';
        sourceUrl = 'https://finance.yahoo.com/quote/%5EKS11';
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden h-full transition-colors duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent"></div>

            {/* Info Icon */}
            <button
                onClick={() => setShowInfo(!showInfo)}
                className="absolute top-3 right-3 text-gray-300 hover:text-indigo-500 transition-colors"
                aria-label="Info"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </button>

            <h2 className="text-gray-500 dark:text-gray-400 text-sm font-semibold tracking-wider mb-2 uppercase">
                {title}
            </h2>

            <div className={`text-5xl font-bold mb-2 ${data ? colorClass.split(' ')[0] : ''}`}>
                {displayScore}
            </div>

            <div className={`px-4 py-1 rounded-full text-sm font-bold mb-4 ${colorClass}`}>
                {data?.rating || 'Loading'}
            </div>

            {/* Source Link */}
            <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 underline decoration-dotted transition-colors"
            >
                Source: {sourceName}
            </a>

            {/* Info Overlay */}
            {showInfo && (
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-50 p-5 flex flex-col text-left overflow-y-auto rounded-2xl transition-opacity animate-fadeIn cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm">{infoTitle}</h3>
                        <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{infoDesc}</p>
                    <div className="space-y-1.5 overflow-y-auto pr-1">
                        {ranges.map((r, idx) => (
                            <div key={idx} className="flex justify-between text-xs border-b border-gray-100 dark:border-gray-700 pb-1 last:border-0">
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{r.range}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-right">{r.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function getTypeTitle(type: string) {
    if (type === 'CRYPTO') return '가상화폐 심리';
    if (type === 'GOLD') return '금 RSI (14D)';
    if (type === 'KOSPI') return 'KOSPI 공포지수';
    return '주식 시장 심리';
}
