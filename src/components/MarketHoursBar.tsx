'use client';

import { useEffect, useState } from 'react';

type Market = {
    name: string;
    flag: string;
    region: string;
    timeZone: string;
    openHour: number;
    openMinute: number;
    closeHour: number;
    closeMinute: number;
    lunchStart?: number;
    lunchEnd?: number;
};

const MARKETS: Market[] = [
    { name: 'USA (NYSE)', flag: '🇺🇸', region: 'New York', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
    { name: 'UK (LSE)', flag: '🇬🇧', region: 'London', timeZone: 'Europe/London', openHour: 8, openMinute: 0, closeHour: 16, closeMinute: 30 },
    { name: 'Japan (TSE)', flag: '🇯🇵', region: 'Tokyo', timeZone: 'Asia/Tokyo', openHour: 9, openMinute: 0, closeHour: 15, closeMinute: 0, lunchStart: 11.5, lunchEnd: 12.5 },
    { name: 'Korea (KRX)', flag: '🇰🇷', region: 'Seoul', timeZone: 'Asia/Seoul', openHour: 9, openMinute: 0, closeHour: 15, closeMinute: 30 },
];

export default function MarketHoursBar() {
    const [statuses, setStatuses] = useState<Record<string, string>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
        const updateStatus = () => {
            const now = new Date();
            const newStatuses: Record<string, string> = {};

            MARKETS.forEach(market => {
                // Get time in target timezone
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: market.timeZone,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: false,
                    weekday: 'short'
                });

                const parts = formatter.formatToParts(now);
                const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
                const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
                const weekday = parts.find(p => p.type === 'weekday')?.value;

                const currentTime = hour + minute / 60;
                const openTime = market.openHour + market.openMinute / 60;
                const closeTime = market.closeHour + market.closeMinute / 60;

                let status = 'CLOSED';

                if (weekday === 'Sat' || weekday === 'Sun') {
                    status = 'CLOSED';
                } else {
                    if (currentTime >= openTime && currentTime < closeTime) {
                        status = 'OPEN';
                        if (market.lunchStart && market.lunchEnd) {
                            if (currentTime >= market.lunchStart && currentTime < market.lunchEnd) {
                                status = 'BREAK';
                            }
                        }
                    } else if (currentTime >= openTime - 1 && currentTime < openTime) {
                        status = 'PRE';
                    } else if (currentTime < openTime) {
                        status = 'WAIT';
                    } else {
                        status = 'CLOSED';
                    }
                }
                newStatuses[market.name] = status;
            });
            setStatuses(newStatuses);
        };

        updateStatus();
        const interval = setInterval(updateStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return <div className="h-10"></div>;

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide select-none mb-2">
            {MARKETS.map((market) => {
                const status = statuses[market.name] || 'CLOSED';
                let statusColor = 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500';
                let dotColor = 'bg-gray-400';
                let label = 'Closed';

                if (status === 'OPEN') {
                    statusColor = 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
                    dotColor = 'bg-green-500 animate-pulse';
                    label = 'Running';
                } else if (status === 'PRE') {
                    statusColor = 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400';
                    dotColor = 'bg-yellow-500';
                    label = 'Pre-Mkt';
                } else if (status === 'POST') {
                    statusColor = 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400';
                    dotColor = 'bg-blue-500';
                    label = 'Post-Mkt';
                } else if (status === 'BREAK') {
                    statusColor = 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400';
                    dotColor = 'bg-orange-500';
                    label = 'Lunch';
                } else if (status === 'WAIT') {
                    statusColor = 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
                    dotColor = 'bg-gray-400';
                    label = 'Opens Later';
                }

                return (
                    <div
                        key={market.name}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-colors ${statusColor}`}
                    >
                        <span className="text-sm">{market.flag}</span>
                        <span>{market.name}</span>
                        <div className="flex items-center gap-1.5 ml-1">
                            <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                            <span className="uppercase tracking-wider text-[10px]">{status === 'OPEN' ? 'OPEN' : label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
