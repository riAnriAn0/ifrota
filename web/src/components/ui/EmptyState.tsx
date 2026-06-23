type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-center">
      <h2 className="text-base font-semibold text-text-main">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-text-muted">
        {description}
      </p>
      {actionLabel && (
        <button
          type="button"
          className="mt-5 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
