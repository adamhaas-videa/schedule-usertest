import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

/**
 * Primary application shell: the product-suite navigation sidebar alongside the
 * routed page content. Full-screen patient-workflow surfaces render outside
 * this layout (no siderail).
 */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
