import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Outline count chiclet — "2 Curodont", "1 Crown". Shared by the AI opportunity
// row in the summary slideout and the V7 card flyout so both read as the same
// kind of object.
export default function OpportunityChiclet({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("bg-background font-medium text-foreground", className)}
    >
      {children}
    </Badge>
  );
}
