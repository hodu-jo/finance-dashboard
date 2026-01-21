'use client';

import { useEffect, useState } from 'react';

export default function MajorEvents() {
    // KST Dates for Jan/Feb 2026
    const events = [
        { date: '2026-01-09', title: '🇺🇸 Nonfarm Payrolls', time: '22:30', importance: 'HIGH' },
        { date: '2026-01-13', title: '🇺🇸 CPI (Dec)', time: '22:30', importance: 'HIGH' },
        { date: '2026-01-29', title: '🇺🇸 FOMC Rate Decision', time: '04:00', importance: 'CRITICAL' }, // Jan 29 04:00 KST
        { date: '2026-01-30', title: '🇺🇸 PCE Inflation', time: '22:30', importance: 'HIGH' },
        { date: '2026-02-06', title: '🇺🇸 Nonfarm Payrolls', time: '22:30', importance: 'HIGH' },
    ];

    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setHydrated(true);
    }, []);

    const getStatus = (dateStr: string) => {
        if (!hydrated) return 'UPCOMING';

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (dateStr < todayStr) return 'DONE';
        if (dateStr === todayStr) return 'TODAY';
        return 'UPCOMING';
    };

    const getDDayString = (dateStr: string) => {
        if (!hydrated) return '';
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Reset time
        const target = new Date(dateStr);
        // Correctly handling date object construction for KST string "2026-01-29" -> 00:00 local time
        const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'D-Day';
        if (diffDays > 0) return `D-${diffDays}`;
        return 'Done';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-colors duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-2 rounded-lg mr-2 text-sm">📅</span>
                주요 경제 일정 (Big 4)
            </h2>
            <div className="space-y-3">
                {events.map((event, idx) => {
                    const status = getStatus(event.date);
                    // Next event is the first one that is NOT DONE (i.e. TODAY or UPCOMING)
                    const isNext = (status === 'TODAY' || status === 'UPCOMING') &&
                        (events.find(e => getStatus(e.date) !== 'DONE') === event);

                    const isDone = status === 'DONE';
                    const dDayLabel = getDDayString(event.date);

                    return (
                        <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border ${isNext
                                    ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 ring-1 ring-purple-400'
                                    : isDone
                                        ? 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-60'
                                        : 'bg-white border-gray-100 dark:bg-gray-700/30 dark:border-gray-600'
                                }`}
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-bold ${isNext ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'
                                        }`}>
                                        {event.title}
                                    </span>
                                    {event.importance === 'CRITICAL' && (
                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-bold">HOT</span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {event.date} • {event.time} (KST)
                                </span>
                            </div>
                            <div className="text-right">
                                {isNext ? (
                                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full animate-pulse">
                                        {dDayLabel}
                                    </span>
                                ) : isDone ? (
                                    <span className="text-xs text-gray-400">종료</span>
                                ) : (
                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                        {dDayLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto pt-4 text-xs text-right text-gray-400 dark:text-gray-500">
                * 일정은 변동될 수 있습니다 (Investing.com 기준)
            </div>
        </div>
    );
}
