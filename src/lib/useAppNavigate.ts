import { useCallback } from "react";
import { useLocation, useNavigate, type NavigateOptions } from "react-router-dom";
import { demoPrefixOf } from "@/lib/demoUrl";

/**
 * `useNavigate`, but absolute app paths keep the `/x/<tokens>` permutation head
 * they were reached under. Call sites stay written in plain app terms
 * (`/schedule`, `/patient/:id/xray`) and never have to know about the prefix.
 */
export function useAppNavigate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const prefix = demoPrefixOf(pathname);

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      navigate(to.startsWith("/") ? `${prefix}${to}` : to, options);
    },
    [navigate, prefix]
  );
}

/** The current pathname with the permutation head stripped off. */
export function useAppPathname(): string {
  const { pathname } = useLocation();
  const prefix = demoPrefixOf(pathname);
  return pathname.slice(prefix.length) || "/";
}
