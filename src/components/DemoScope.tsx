import { useEffect, useRef } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import AppLayout from "@/components/navigation/AppLayout";
import SchedulePage from "@/pages/SchedulePage";
import ProductPlaceholderPage from "@/pages/ProductPlaceholderPage";
import FmxViewerPage from "@/pages/FmxViewerPage";
import SingleImagePage from "@/pages/SingleImagePage";
import VoiceNotesPage from "@/pages/VoiceNotesPage";
import VoicePerioPage from "@/pages/VoicePerioPage";
import ChartPage from "@/pages/ChartPage";
import { useAiView } from "@/context/AiViewContext";
import { DEMO_PREFIX, decodeDemo, encodeDemo } from "@/lib/demoUrl";

/**
 * The whole app, mounted under a `/x/<tokens>` permutation head, with the demo
 * selection kept in step with that head in both directions.
 *
 * Child routes are written relative (`schedule`, not `/schedule`) because a
 * descendant <Routes> matches against what is left of the pathname after the
 * parent's `/x/:tokens/*` match.
 */
export default function DemoScope() {
  const { tokens } = useParams<{ tokens: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cardVersion,
    setCardVersion,
    cardColorMode,
    setCardColorMode,
    summaryVersion,
    setSummaryVersion,
    cardSummaryOn,
    setCardSummaryOn,
    navVersion,
    setNavVersion,
    navFooterMode,
    setNavFooterMode,
  } = useAiView();

  const prefix = `${DEMO_PREFIX}/${tokens ?? ""}`;
  const encoded = encodeDemo({
    cardVersion,
    cardColorMode,
    summaryVersion,
    cardSummaryOn,
    navVersion,
    navFooterMode,
  });

  // One ref arbitrates both directions: whichever side moved last records the
  // agreed token string, and the other side sees a match and stands down.
  // Without it the two effects fight — a Back button would be immediately
  // undone by the state-to-URL write.
  const settled = useRef(tokens);

  // URL -> state. Fires on Back/Forward and on an in-app jump to another
  // permutation. A fresh page load needs no work here: AiViewProvider seeds
  // itself from the URL, so the first paint is already the right condition.
  useEffect(() => {
    if (tokens === settled.current) return;
    settled.current = tokens;
    const next = decodeDemo(tokens);
    setCardVersion(next.cardVersion);
    setCardColorMode(next.cardColorMode);
    setSummaryVersion(next.summaryVersion);
    setCardSummaryOn(next.cardSummaryOn);
    setNavVersion(next.navVersion);
    setNavFooterMode(next.navFooterMode);
  }, [
    tokens,
    setCardVersion,
    setCardColorMode,
    setSummaryVersion,
    setCardSummaryOn,
    setNavVersion,
    setNavFooterMode,
  ]);

  // State -> URL. Rewrites the head whenever the demo menu changes something,
  // and also normalises a shorthand link (`/x/c6`) to the full six-token form.
  useEffect(() => {
    if (encoded === settled.current) return;
    settled.current = encoded;
    const rest = location.pathname.slice(prefix.length) || "/schedule";
    navigate(
      `${DEMO_PREFIX}/${encoded}${rest}${location.search}${location.hash}`,
      { replace: true }
    );
  }, [
    encoded,
    navigate,
    prefix,
    location.pathname,
    location.search,
    location.hash,
  ]);

  const schedule = `${prefix}/schedule`;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={schedule} replace />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="voice-notes" element={<ProductPlaceholderPage />} />
        <Route path="autoverify" element={<ProductPlaceholderPage />} />
        <Route path="clean-claims" element={<ProductPlaceholderPage />} />
        <Route path="recall" element={<ProductPlaceholderPage />} />
        <Route path="referrals" element={<ProductPlaceholderPage />} />
        <Route path="ambient-intel" element={<ProductPlaceholderPage />} />
        <Route path="insights" element={<ProductPlaceholderPage />} />
        <Route path="engagement" element={<ProductPlaceholderPage />} />
      </Route>

      <Route path="patient/:id/xray" element={<FmxViewerPage />} />
      <Route path="patient/:id/image/:slot" element={<SingleImagePage />} />
      <Route path="patient/:id/voice-notes" element={<VoiceNotesPage />} />
      <Route path="patient/:id/perio" element={<VoicePerioPage />} />
      <Route path="patient/:id/chart" element={<ChartPage />} />

      <Route path="*" element={<Navigate to={schedule} replace />} />
    </Routes>
  );
}
