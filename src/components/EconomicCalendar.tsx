'use client';

export default function EconomicCalendar() {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-2 text-sm">📅</span>
                주요 경제 일정
            </h2>
            <div className="flex-1 w-full min-h-[400px] rounded-xl overflow-hidden bg-white">
                <iframe
                    src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=11,5&calType=day&timeZone=8&lang=86"
                    width="100%"
                    height="100%"
                    className="border-0 w-full h-full min-h-[500px]"
                ></iframe>
            </div>
            <div className="mt-2 text-right">
                <span className="text-xs text-gray-400 dark:text-gray-500">Provided by Investing.com</span>
            </div>
        </div>
    );
}
