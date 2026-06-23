type HeaderProps = {
  title: string;
  subtitle?: string;
  userName?: string;
  onMenuClick: () => void;
};

export default function Header({
  title,
  subtitle,
  userName,
  onMenuClick,
}: HeaderProps) {
  const initials = (userName || "IF")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-4 py-3 shadow-sm backdrop-blur lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-primary-800 transition hover:bg-primary-100 lg:hidden"
        >
          <span className="text-xl leading-none">=</span>
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-text-main sm:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-sm text-text-muted">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-text-main">
              {userName || "Usuario"}
            </p>
            <p className="text-xs text-text-muted">IFROTA</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-700 text-sm font-semibold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
