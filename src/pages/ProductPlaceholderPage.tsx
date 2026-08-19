import { useLocation } from "react-router-dom";
import { productNav } from "@/components/navigation/products";

export default function ProductPlaceholderPage() {
  const location = useLocation();
  const entry = productNav.find(
    (e) => e.type !== "divider" && e.path === location.pathname
  );
  const label =
    entry && entry.type !== "divider" ? entry.label : "Coming soon";

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="h-14 shrink-0 bg-card border-b border-border flex items-center px-6">
        <h1 className="text-xl font-semibold text-foreground">{label}</h1>
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
