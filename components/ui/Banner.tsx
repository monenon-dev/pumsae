import Link from "next/link";

export function Banner({
  children,
  actionLabel,
  actionHref,
}: {
  children: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="border-b border-pumsae-line bg-pumsae-accent/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm text-pumsae-ink sm:px-6">
        <p>{children}</p>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="shrink-0 font-semibold text-pumsae-accent hover:underline"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
