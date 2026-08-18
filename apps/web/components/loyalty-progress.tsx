import { Gift, Star } from "lucide-react";

export function LoyaltyProgress({ stamps = 5 }: { stamps?: number }) {
  const normalized = Math.min(8, Math.max(0, stamps));
  return (
    <article className="dashboard-card loyalty-progress-card">
      <div className="card-heading"><div><span>SHINE CLUB</span><h3>Your loyalty card</h3></div><Gift /></div>
      <div className="stamp-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((stamp) => (
          <span key={stamp} className={stamp <= normalized ? "earned" : ""}>
            {stamp <= normalized ? <Star size={18} fill="currentColor" /> : stamp}
          </span>
        ))}
      </div>
      <div className="loyalty-progress-copy"><strong>{8 - normalized} more {8 - normalized === 1 ? "wash" : "washes"}</strong><span>until your freebie</span></div>
      <div className="progress-track"><span style={{ width: `${(normalized / 8) * 100}%` }} /></div>
    </article>
  );
}
