import CurrentDate from '../components/CurrentDate';

import MarketStatus from '../components/MarketStatus';
import SentimentPanel from '../components/SentimentPanel';

import MarketHoursBar from '../components/MarketHoursBar';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-4 pl-2 flex justify-between items-end">
          <div>
            <CurrentDate />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              굿모닝, <span className="text-blue-600 dark:text-blue-400">Morning Finance</span>
            </h1>
          </div>
        </header>

        <MarketHoursBar />

        {/* Top Section: Indices & Sentiment */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <ErrorBoundary>
            <MarketStatus />
          </ErrorBoundary>
          <SentimentPanel />
        </div>

        <footer className="text-center text-gray-400 dark:text-gray-600 text-xs py-8">
          © 2026 Morning Finance. All data is provided for informational purposes only.
        </footer>
      </div>
    </main>
  );
}
