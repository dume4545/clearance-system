export default function StatusBadge({ status }) {
  const cls = {
    pending:  'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }[status] ?? 'badge-pending';

  return (
    <span className={cls}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
