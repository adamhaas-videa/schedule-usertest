import DemoMenu from "@/components/DemoMenu";
import { PRODUCT_ITEMS, isNavItem } from "@/components/navigation/products";
import { useAiView } from "@/context/AiViewContext";
import { findNavItemByPath } from "@/lib/navVersions";
import { useLocation } from "react-router-dom";
import UpsellPage from "@/pages/UpsellPage";

function labelForPath(path: string): string {
  const item = Object.values(PRODUCT_ITEMS).find((entry) => entry.path === path);
  return item?.label ?? "Coming soon";
}

export default function ProductPlaceholderPage() {
  const location = useLocation();
  const { navVersion } = useAiView();
  const navItem = findNavItemByPath(navVersion, location.pathname);

  if (navItem?.locked) {
    return <UpsellPage item={navItem} />;
  }

  const catalogItem = Object.values(PRODUCT_ITEMS).find(
    (entry) => isNavItem(entry) && entry.path === location.pathname
  );
  const label = navItem?.label ?? catalogItem?.label ?? labelForPath(location.pathname);

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="h-14 shrink-0 bg-card border-b border-border flex items-center gap-4 px-4">
        <h1 className="text-xl font-semibold text-foreground">{label}</h1>
        <div className="flex-1 min-w-0" />
        <DemoMenu />
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="flex items-center justify-center size-14 rounded-full bg-muted text-muted-foreground">
          <i className="fa-regular fa-screwdriver-wrench text-xl" aria-hidden />
        </div>
        <p className="text-lg font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          This surface is part of the reimagined product suite and is coming in a
          later phase.
        </p>
      </div>
    </div>
  );
}
