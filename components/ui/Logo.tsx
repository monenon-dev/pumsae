export function PumsaeLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-wide text-pumsae-ink ${className}`}
    >
      <span className="h-2 w-2 rounded-sm bg-pumsae-accent" aria-hidden />
      PUMSAE
    </span>
  );
}
