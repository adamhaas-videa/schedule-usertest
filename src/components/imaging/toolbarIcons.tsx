/* eslint-disable react-refresh/only-export-components -- toolbar icons share a color helper with the SVG components in this file */
import { cn } from "@/lib/utils";

/** Visual state of a toolbar item, driving icon colors. */
export type IconState = "rest" | "hover" | "active";

/**
 * Custom imaging-toolbar icons.
 *
 * These reproduce the exact vector data exported from the Figma "states" frame
 * (node 69:1253) rather than hand-drawn approximations. Each icon is
 * parameterized by `state` so the tooth body and its accent recolor between the
 * grayscale rest look and the colored hover/active look, matching the design's
 * per-state asset swaps.
 */

interface IconProps {
  state?: IconState;
  className?: string;
}

// Patient — tooth with a colored pulp. Body: zinc-300 (rest) → cyan-white (on).
// Accent (pulp): zinc-500 (rest) → pink-600 (on). Hover === active (one "on" look).
const PATIENT_COLORS: Record<IconState, { body: string; accent: string }> = {
  rest: { body: "#D4D4D8", accent: "#71717A" },
  hover: { body: "#EAFDFF", accent: "#DB2777" },
  active: { body: "#EAFDFF", accent: "#DB2777" },
};

export function PatientToothIcon({ state = "rest", className }: IconProps) {
  const c = PATIENT_COLORS[state];
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-hidden
    >
      <path
        d="M8.51561 1.65368L8.55793 1.67321L8.84534 1.75591L9.35205 1.84804C9.51319 1.86039 9.75742 1.87568 9.75742 1.87568C9.91344 1.88265 10.0338 1.8941 10.5129 1.86646L10.9275 1.79276L11.2223 1.64535C11.9254 1.02035 12.6562 0.833366 13.5937 0.833366C15.7422 0.833366 17.4609 2.59118 17.4609 4.73962V4.81774C17.4609 5.44274 17.3437 6.02868 17.0703 6.61462L16.1328 8.45055C15.9766 8.80212 15.8594 9.15368 15.7812 9.5443L14.3359 17.5912C14.2578 18.0209 13.9062 18.3334 13.4375 18.3334C13.0078 18.3724 12.6172 18.0599 12.5 17.6302L11.3672 12.9037C11.2109 12.2396 10.6641 11.7709 9.99999 11.7709C9.33593 11.7709 8.74999 12.2396 8.59374 12.9037L7.46093 17.6302C7.34374 18.0599 6.95311 18.3724 6.52343 18.3724C6.05468 18.3334 5.70311 18.0209 5.62499 17.5912L4.17968 9.5443C4.10155 9.15368 3.98436 8.80212 3.82811 8.45055L2.89061 6.61462C2.61718 6.02868 2.49999 5.44274 2.49999 4.81774V4.58337C2.49999 2.51305 4.14061 0.833366 6.21093 0.833366C7.03124 0.833366 7.85155 1.14587 8.51561 1.65368Z"
        fill={c.body}
      />
      <path
        d="M10.714 3.21427C10.3569 2.85712 9.99973 2.85712 9.28545 2.49998L8.02659 2.17692C7.4559 1.71365 6.75094 1.42855 6.04598 1.42855C4.2668 1.42855 2.85687 2.96092 2.85687 4.84966V5.06348C2.85687 5.63366 2.95758 6.16821 3.19257 6.70275C3.9283 7.85712 5.71402 11.7857 9.743 9.99998C10.3569 8.92855 11.4283 6.64159 11.4283 6.07141V4.84966C11.0712 3.92855 11.4283 4.2857 10.714 3.21427Z"
        fill={c.accent}
      />
    </svg>
  );
}

// Clinical — tooth with a findings box. Body: zinc-300 (rest) → cyan-white (on).
// Accent (box stroke): zinc-500 (rest) → red-600 (on). Hover === active (one "on" look).
const CLINICAL_COLORS: Record<IconState, { body: string; accent: string }> = {
  rest: { body: "#D4D4D8", accent: "#71717A" },
  hover: { body: "#EAFDFF", accent: "#DC2626" },
  active: { body: "#EAFDFF", accent: "#DC2626" },
};

export function ClinicalToothIcon({ state = "rest", className }: IconProps) {
  const c = CLINICAL_COLORS[state];
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-hidden
    >
      <path
        d="M8.51561 1.65373L8.55793 1.67326L8.84534 1.75596L9.35205 1.84809C9.51319 1.86044 9.75742 1.87573 9.75742 1.87573C9.91344 1.8827 10.0338 1.89415 10.5129 1.86651L10.9275 1.79281L11.2223 1.6454C11.9254 1.0204 12.6562 0.833414 13.5937 0.833414C15.7422 0.833414 17.4609 2.59123 17.4609 4.73966V4.81779C17.4609 5.44279 17.3437 6.02873 17.0703 6.61466L16.1328 8.4506C15.9766 8.80216 15.8594 9.15373 15.7812 9.54435L14.3359 17.5912C14.2578 18.0209 13.9062 18.3334 13.4375 18.3334C13.0078 18.3725 12.6172 18.06 12.5 17.6303L11.3672 12.9037C11.2109 12.2397 10.6641 11.7709 9.99999 11.7709C9.33593 11.7709 8.74999 12.2397 8.59374 12.9037L7.46093 17.6303C7.34374 18.06 6.95311 18.3725 6.52343 18.3725C6.05468 18.3334 5.70311 18.0209 5.62499 17.5912L4.17968 9.54435C4.10155 9.15373 3.98436 8.80216 3.82811 8.4506L2.89061 6.61466C2.61718 6.02873 2.49999 5.44279 2.49999 4.81779V4.58341C2.49999 2.5131 4.14061 0.833414 6.21093 0.833414C7.03124 0.833414 7.85155 1.14591 8.51561 1.65373Z"
        fill={c.body}
      />
      <rect
        x="10.7143"
        y="0.714286"
        width="7.14286"
        height="7.14286"
        stroke={c.accent}
        strokeWidth="1.42857"
      />
    </svg>
  );
}

// Elements — composite of two squares + a circle + a diagonal bar. Cool-grey at
// rest; each shape takes its own (semantic finding-type) accent on hover/active.
const ELEMENTS_COLORS: Record<
  IconState,
  { s1: string; s2: string; c: string; p: string }
> = {
  rest: { s1: "#8b949c", s2: "#8b949c", c: "#8b949c", p: "#8b949c" },
  hover: { s1: "#DD174C", s2: "#D4A700", c: "#992D5B", p: "#FF8A1E" },
  active: { s1: "#DD174C", s2: "#D4A700", c: "#992D5B", p: "#FF8A1E" },
};

export function ElementsIcon({ state = "rest" }: { state?: IconState }) {
  const c = ELEMENTS_COLORS[state];
  return (
    <span className="flex flex-col items-center justify-center gap-[2px]">
      <span className="flex items-start gap-[2px]">
        <span
          className="block size-[8px] rounded-[1px]"
          style={{ backgroundColor: c.s1 }}
        />
        <span
          className="block size-[8px] rounded-[1px]"
          style={{ backgroundColor: c.s2 }}
        />
      </span>
      <span className="flex items-center gap-[2.5px]">
        <span
          className="block size-[7px] rounded-full"
          style={{ backgroundColor: c.c }}
        />
        <span className="flex size-[7px] items-center justify-center">
          <span
            className="block h-[8px] w-[1.6px] -rotate-45 rounded-full"
            style={{ backgroundColor: c.p }}
          />
        </span>
      </span>
    </span>
  );
}

/** HD1 / HD2 badge icons, ported from the image-toolbar playground. */
function HdLabel({ label }: { label: "HD1" | "HD2" }) {
  return (
    <svg viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-auto" aria-hidden>
      <rect
        x="0.75"
        y="0.75"
        width="20.5"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="11"
        y="10.25"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="currentColor"
      >
        {label}
      </text>
    </svg>
  );
}

export function Hd1Icon() {
  return <HdLabel label="HD1" />;
}

export function Hd2Icon() {
  return <HdLabel label="HD2" />;
}

export function PeriodontalMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-hidden
    >
      <line
        x1="5.05"
        y1="5.35"
        x2="16.16"
        y2="16.47"
        stroke="#FF8A1E"
        strokeWidth="2.4"
      />
      <rect
        y="6.36"
        width="8.57"
        height="8.57"
        rx="0.84"
        transform="rotate(-45 0 6.36)"
        fill="#FF8A1E"
      />
    </svg>
  );
}

// AI — letterform rendered as text. Cool-grey at rest; bright cyan when on.
// Hover === active, so hovering the toggle previews the "on" cyan.
export function aiTextColor(state: IconState): string {
  if (state === "active") return "#5FD8F0";
  if (state === "hover") return "#5FD8F0";
  return "#8b949c";
}
