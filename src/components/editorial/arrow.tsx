import type { SVGProps } from "react";

/** The one arrow glyph used across the public site (rows, buttons, links). */
export function Arrow({ direction = "right", ...props }: SVGProps<SVGSVGElement> & { direction?: "right" | "up-right" | "down" | "left" }) {
  const rotate = { right: 0, "up-right": -45, down: 90, left: 180 }[direction];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="ed-arrow"
      style={rotate ? { rotate: `${rotate}deg` } : undefined}
      {...props}
    >
      <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />
    </svg>
  );
}
