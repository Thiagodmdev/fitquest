interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="panel stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="muted stat-hint">{hint}</span>}
    </div>
  );
}
