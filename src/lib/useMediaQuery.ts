import { useEffect, useState } from "react";

/** Tailwind's `xl` breakpoint, as a media query, for JS-side layout decisions. */
export const XL_UP = "(min-width: 1280px)";

/** Tracks a CSS media query. Starts from the current match so there's no flash. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
