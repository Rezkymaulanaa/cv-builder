import type { SVGProps } from "react";

// Stroke icons drawn on a 24px grid. Decorative by default: pair them with text.
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-4 shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const ArrowRight = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const ArrowLeft = (p: P) => (
  <Icon {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Icon>
);
export const ArrowUp = (p: P) => (
  <Icon {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
);
export const ArrowDown = (p: P) => (
  <Icon {...p}>
    <path d="M12 5v14M18 13l-6 6-6-6" />
  </Icon>
);
export const Check = (p: P) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);
export const ChevronDown = (p: P) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);
export const Download = (p: P) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Icon>
);
export const Upload = (p: P) => (
  <Icon {...p}>
    <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />
  </Icon>
);
export const Plus = (p: P) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const Trash = (p: P) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
  </Icon>
);
export const More = (p: P) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Icon>
);
export const FileText = (p: P) => (
  <Icon {...p}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </Icon>
);
export const Palette = (p: P) => (
  <Icon {...p}>
    <path d="M12 3a9 9 0 100 18c1.1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 005-5c0-4-4-7.2-9-7.2z" />
    <circle cx="7.5" cy="11.5" r="1" />
    <circle cx="10.5" cy="7.5" r="1" />
    <circle cx="15.5" cy="8.5" r="1" />
  </Icon>
);
export const Briefcase = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" />
  </Icon>
);
export const GraduationCap = (p: P) => (
  <Icon {...p}>
    <path d="M2 9l10-5 10 5-10 5L2 9z" />
    <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
  </Icon>
);
export const User = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.4-6 8-6s6.5 2 8 6" />
  </Icon>
);
export const Layers = (p: P) => (
  <Icon {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Icon>
);
export const Star = (p: P) => (
  <Icon {...p}>
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" />
  </Icon>
);
export const RotateLeft = (p: P) => (
  <Icon {...p}>
    <path d="M4 4v5h5" />
    <path d="M4.6 9A8 8 0 1112 20" />
  </Icon>
);
export const RotateRight = (p: P) => (
  <Icon {...p}>
    <path d="M20 4v5h-5" />
    <path d="M19.4 9A8 8 0 1012 20" />
  </Icon>
);
export const X = (p: P) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
