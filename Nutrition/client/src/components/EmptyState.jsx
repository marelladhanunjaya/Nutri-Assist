export default function EmptyState({ icon = 'bi-basket2', title, text }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} />
      <h5>{title}</h5>
      <p>{text}</p>
    </div>
  );
}
