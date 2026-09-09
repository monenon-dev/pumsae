type BadgeVariant = "muted" | "warning" | "accent";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  muted: "bg-pumsae-line text-pumsae-muted",
  warning: "bg-pumsae-accent/10 text-pumsae-accent",
  accent: "bg-pumsae-accent text-white",
};

export function Badge({
  children,
  variant = "muted",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
