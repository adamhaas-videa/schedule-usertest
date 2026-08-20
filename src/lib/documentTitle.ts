import { isNavItem, productNav } from "@/components/navigation/products";
import { CLINICAL_TAB_NAV } from "@/types/clinical";

const BRAND = "Videa";

export function titleForPath(pathname: string): string {
  const patientRest = pathname.match(/^\/patient\/[^/]+\/(.+)$/)?.[1];
  if (patientRest) {
    if (patientRest.startsWith("image/")) return `${BRAND} Images`;
    const tab = CLINICAL_TAB_NAV.find(
      (t) => patientRest === t.path || patientRest.startsWith(`${t.path}/`)
    );
    if (tab) return `${BRAND} ${tab.label}`;
  }

  const product = productNav.find(
    (entry) =>
      isNavItem(entry) &&
      (pathname === entry.path || pathname.startsWith(`${entry.path}/`))
  );
  if (product && isNavItem(product)) {
    return `${BRAND} ${product.label}`;
  }

  return BRAND;
}
