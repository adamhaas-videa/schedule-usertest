import { useLayoutEffect } from "react";
import { titleForPath } from "@/lib/documentTitle";
import { useAppPathname } from "@/lib/useAppNavigate";

/** Sets `document.title` from the current route (`Videa Schedule`, `Videa Images`, …). */
export default function DocumentTitle() {
  const pathname = useAppPathname();

  useLayoutEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);

  return null;
}
