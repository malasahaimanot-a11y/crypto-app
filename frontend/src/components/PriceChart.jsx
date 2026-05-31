import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Filler
} from 'chart.js';
import { useCoinHistory } from '../hooks/useApi.js';
import { useFormatter } from '../hooks/useFormatter.js';
import { useApp } from '../contexts/AppContext.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const RANGE_OPTIONS = [
  { label: '1Y', days: '1', labelHe: '1ד' },
  { label: '7D', days: '7', labelHe: '7י' },
  { label: '30D', days: '30', labelHe: '30י' },
  { label: '90D', days: '90', labelHe: '90י' },
  { label: '1Y', days: '365', labelHe: 'שנה' },
];

export default function PriceChart({ coinId, selectedDays, onRangeChange }) {
  const { state } = useApp();
  const { formatPrice } = useFormatter();
  const { data, isLoading } = useCoinHistory(coinId, selectedDays, state.currency);

  const { chartData, isUp } = useMemo(() => {
    if (!data?.prices) return { chartData: null, isUp: true };
    const prices = data.prices;
    const firstPrice = prices[0]?.[1] ?? 0;
    const lastPrice = prices[prices.length - 1]?.[1] ?? 0;
    const up = lastPrice >= firstPrice;

    const color = up ? '#22c55e' : '#f87171';
    const labels = prices.map(([ts]) => {
      const d = new Date(ts);
      return selectedDays <= 2
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    });

    return {
      isUp: up,
      chartData: {
        labels,
        datasets: [{
          data: prices.map(([, p]) => p),
          borderColor: color,
          backgroundColor: `${color}22`,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
        }]
      }
    };
  }, [data, selectedDays]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        bodyFont: { size: 15, weight: '600' },
        callbacks: {
          label: ctx => ` ${formatPrice(ctx.parsed.y)}`,
        }
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', maxTicksLimit: 6, font: { size: 12 } },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 12 },
          callback: v => formatPrice(v, { notation: 'compact' }),
        },
      },
    },
  };

  return (
    <div>
      <div role="group" aria-label="בחר טווח תאריכים" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {RANGE_OPTIONS.map(r => (
          <button
            key={r.days}
            onClick={() => onRangeChange(r.days)}
            className={`btn ${selectedDays === r.days ? 'btn-primary' : 'btn-ghost'}`}
            aria-pressed={selectedDays === r.days}
            style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--size-sm)' }}
          >
            {state.lang === 'he' ? r.labelHe : r.label}
          </button>
        ))}
      </div>

      <div style={{ height: 280, position: 'relative' }} role="img" aria-label="גרף מחיר">
        {isLoading && (
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} aria-hidden="true" />
        )}
        {!isLoading && chartData && (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
