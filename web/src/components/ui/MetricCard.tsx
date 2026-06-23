type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  icon?: string;
  onClick?: () => void;
};

const toneClasses: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "border-border bg-surface text-primary-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export default function MetricCard({
  label,
  value,
  detail,
  tone = "default",
  icon,
  onClick,
}: MetricCardProps) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-text-muted">{label}</p>
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-lg shadow-sm">
            {icon}
          </span>
        )}
      </div>

      <p className="mt-4 text-3xl font-semibold leading-none text-text-main">
        {value}
      </p>
      <p className="mt-3 text-sm leading-5 text-text-muted">{detail}</p>
      {onClick && (
        <span className="mt-4 text-xs font-semibold uppercase tracking-wide">
          Acessar
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`min-h-40 rounded-lg border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${toneClasses[tone]}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`min-h-40 rounded-lg border p-4 shadow-sm ${toneClasses[tone]}`}>
      {content}
    </div>
  );
}
