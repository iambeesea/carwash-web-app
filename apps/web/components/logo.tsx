import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="WashWise home">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-spark">✦</span>
        W
      </span>
      {compact ? null : (
        <span className="brand-copy">
          <strong>WASHWISE</strong>
          <small>CAR CARE</small>
        </span>
      )}
    </Link>
  );
}
