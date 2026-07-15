export default function StatCard({ icon, label, value, helper, tone = 'green' }) {
  return (
    <div className="stat-card h-100">
      <div className={`stat-icon ${tone}`}><i className={`bi ${icon}`} /></div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
        {helper && <div className="stat-helper">{helper}</div>}
      </div>
    </div>
  );
}
