import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AiViewProvider } from "@/context/AiViewProvider";
import { ImagingToolbarProvider } from "@/context/ImagingToolbarContext";
import DocumentTitle from "@/components/DocumentTitle";
import DemoScope from "@/components/DemoScope";
import {
  DEFAULT_DEMO_SELECTION,
  DEMO_PREFIX,
  PRESET_PREFIX,
  encodeDemo,
  findPreset,
} from "@/lib/demoUrl";

/**
 * `/t/<preset>` — the short link handed to a test participant. Resolves the
 * named condition and bounces onto the canonical `/x/<tokens>` form so the
 * address bar spells the permutation out from then on. An unknown name falls
 * back to the default rather than 404ing, so a mistyped link still works.
 */
function PresetRedirect() {
  const params = useParams<{ preset: string; "*": string }>();
  const selection = findPreset(params.preset)?.selection ?? DEFAULT_DEMO_SELECTION;
  const rest = params["*"] ? `/${params["*"]}` : "/schedule";
  return <Navigate to={`${DEMO_PREFIX}/${encodeDemo(selection)}${rest}`} replace />;
}

/**
 * Anything without a permutation head — `/`, a bare `/schedule`, an old
 * `/patient/…` bookmark — gets the default one, keeping the path it asked for.
 */
function DefaultRedirect() {
  const { pathname, search, hash } = useLocation();
  const path = pathname === "/" ? "/schedule" : pathname;
  const head = `${DEMO_PREFIX}/${encodeDemo(DEFAULT_DEMO_SELECTION)}`;
  return <Navigate to={`${head}${path}${search}${hash}`} replace />;
}

export default function App() {
  return (
    <AiViewProvider>
      <ImagingToolbarProvider>
        <DocumentTitle />
        <Routes>
          <Route path={`${DEMO_PREFIX}/:tokens/*`} element={<DemoScope />} />
          <Route path={`${PRESET_PREFIX}/:preset/*`} element={<PresetRedirect />} />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </ImagingToolbarProvider>
    </AiViewProvider>
  );
}
