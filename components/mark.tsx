export function TitleScarMark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden="true" fill="none">
        <rect
          x="4"
          y="6"
          width="20"
          height="16"
          rx="1.5"
          className="stroke-foreground"
          strokeWidth="1.5"
        />
        <path
          d="M7 11h14"
          className="stroke-foreground/40"
          strokeWidth="1.2"
        />
        <path
          d="M7 15h8"
          className="stroke-foreground/35"
          strokeWidth="1.2"
        />
        <path
          d="M5 18.5c4-3 7 3 11-1s5 2 8-1"
          className="stroke-primary"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
