import { scrapPrices } from '../data/mockData';

export default function ScrapTicker() {
  const items = [...scrapPrices, ...scrapPrices];
  return (
    <div className="w-full overflow-hidden bg-deep-dark/80 border-y border-card-border py-2">
      <div className="flex animate-ticker-scroll whitespace-nowrap" style={{ width: 'max-content' }}>
        {items.map((p, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs font-mono">
            <span className="text-text-secondary">{p.name}</span>
            <span className="text-text-primary font-semibold">{p.price} {p.unit}</span>
            <span className={p.change >= 0 ? 'text-safe-green' : 'text-danger-red'}>
              {p.change >= 0 ? '▲' : '▼'} {Math.abs(p.change)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
