'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type SparklineProps = {
    data: { date: string; close: number }[];
    // color prop removed as it was unused and overriding logic is inside
};

export default function Sparkline({ data }: SparklineProps) {
    if (!data || data.length === 0) return null;

    // Filter out any potential bad data points just in case
    const validData = data.filter(d => typeof d.close === 'number' && d.close > 0);
    if (validData.length === 0) return null;

    const prices = validData.map(d => d.close);
    const labels = validData.map(d => {
        const date = new Date(d.date);
        return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    });

    // Determine color based on trend
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const isPositive = endPrice >= startPrice;
    const finalColor = isPositive ? '#ef4444' : '#3b82f6'; // Red for up (KR style), Blue for down

    const chartData = {
        labels,
        datasets: [
            {
                data: prices,
                borderColor: finalColor,
                backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 40);
                    gradient.addColorStop(0, isPositive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    return gradient;
                },
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 4,
                fill: true,
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: false,
            }
        },
        scales: {
            x: { display: false },
            y: {
                display: false,
                // Dynamic scaling based on range
                min: (() => {
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const range = max - min;
                    if (range === 0) return min - 1;
                    return min - (range * 0.02); // 2% bottom padding
                })(),
                max: (() => {
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const range = max - min;
                    if (range === 0) return max + 1;
                    return max + (range * 0.02); // 2% top padding
                })()
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        },
        maintainAspectRatio: false
    };

    return (
        <div className="h-24 w-full">
            <Line options={options} data={chartData} />
        </div>
    );
}
