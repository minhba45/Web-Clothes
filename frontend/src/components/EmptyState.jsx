export default function EmptyState({ icon = "📦", title, description, action }) {
  return (
    <div className="empty-state-block">
      <span className="empty-icon" aria-hidden>
        {icon}
      </span>
      <h3>{title}</h3>
      {description && <p className="muted">{description}</p>}
      {action}
    </div>
  );
}
