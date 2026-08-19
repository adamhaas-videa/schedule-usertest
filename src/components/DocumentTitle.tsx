import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { titleForPath } from "@/lib/documentTitle";

/** Sets `document.title` from the current route (`Videa Schedule`, `Videa Images`, …). */
export default function DocumentTitle() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);

  return null;
}
