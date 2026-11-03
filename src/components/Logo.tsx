import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 rounded-lg text-ink">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[10px] bg-ink text-white shadow-[inset_0_-2px_0_rgb(255_255_255/0.12)] transition-transform group-hover:-rotate-6"
      >
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none">
          <path d="M7 4h7l4 4v12H7z" fill="currentColor" opacity="0.18" />
          <path d="M7 4h7l4 4v12H7V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10 12h5M10 15.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight">
        CV<span className="text-primary">.</span>Builder
      </span>
    </Link>
  );
}
