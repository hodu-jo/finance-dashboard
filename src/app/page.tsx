import NewsCard from '../components/NewsCard';
import FearGreedCard from '../components/FearGreedCard';
import MarketStatus from '../components/MarketStatus';
import WatchList from '../components/WatchList';
import SentimentPanel from '../components/SentimentPanel';

export default function Home() {
  const today = new Date().toLocaleDateString('ko-KR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8 pl-2">
          <p className="text-gray-500 text-sm font-medium">{today}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            굿모닝, <span className="text-blue-600">Morning Finance</span>
          </h1>
        </header>

        {/* Top Section: Indices & Fear/Greed */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <MarketStatus />
          <div className="col-span-1 md:col-span-2">
            <SentimentPanel />
          </div>
        </div>

        {/* Bottom Section: News & Watchlist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <NewsCard />
          </div>
          <div className="col-span-1 md:col-span-1">
            <WatchList />
          </div>
        </div>
      </div>
    </main>
  );
}
