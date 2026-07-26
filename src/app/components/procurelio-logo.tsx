type ProcurelioLogoProps = {
  className?: string;
  compact?: boolean;
};

export function ProcurelioMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`procurelio-mark ${className}`}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 38V18C7 10.82 12.82 5 20 5H25C32.18 5 38 10.82 38 18C38 25.18 32.18 31 25 31H17V38H7Z"
        fill="currentColor"
      />
      <path d="M17 15H25C26.66 15 28 16.34 28 18C28 19.66 26.66 21 25 21H17V15Z" fill="var(--logo-paper, #F5F1E8)" />
      <path d="M17 26H27L17 35V26Z" fill="var(--logo-accent, #B56D50)" />
    </svg>
  );
}

export function ProcurelioLogo({ className = "", compact = false }: ProcurelioLogoProps) {
  return (
    <span className={`procurelio-logo ${className}`}>
      <ProcurelioMark />
      {!compact && <span className="procurelio-wordmark">Procurelio</span>}
    </span>
  );
}
