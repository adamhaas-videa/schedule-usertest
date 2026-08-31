import { Navigate, Route, Routes } from "react-router-dom";
import { AiViewProvider } from "@/context/AiViewProvider";
import { ImagingToolbarProvider } from "@/context/ImagingToolbarContext";
import DocumentTitle from "@/components/DocumentTitle";
import AppLayout from "@/components/navigation/AppLayout";
import SchedulePage from "@/pages/SchedulePage";
import ProductPlaceholderPage from "@/pages/ProductPlaceholderPage";
import FmxViewerPage from "@/pages/FmxViewerPage";
import SingleImagePage from "@/pages/SingleImagePage";
import VoiceNotesPage from "@/pages/VoiceNotesPage";
import VoicePerioPage from "@/pages/VoicePerioPage";
import ChartPage from "@/pages/ChartPage";

export default function App() {
  return (
    <AiViewProvider>
      <ImagingToolbarProvider>
        <DocumentTitle />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/schedule" replace />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/voice-notes" element={<ProductPlaceholderPage />} />
            <Route path="/autoverify" element={<ProductPlaceholderPage />} />
            <Route path="/clean-claims" element={<ProductPlaceholderPage />} />
            <Route path="/recall" element={<ProductPlaceholderPage />} />
            <Route path="/referrals" element={<ProductPlaceholderPage />} />
            <Route path="/ambient-intel" element={<ProductPlaceholderPage />} />
            <Route path="/insights" element={<ProductPlaceholderPage />} />
            <Route path="/engagement" element={<ProductPlaceholderPage />} />
          </Route>

          <Route path="/patient/:id/xray" element={<FmxViewerPage />} />
          <Route path="/patient/:id/image/:slot" element={<SingleImagePage />} />
          <Route path="/patient/:id/voice-notes" element={<VoiceNotesPage />} />
          <Route path="/patient/:id/perio" element={<VoicePerioPage />} />
          <Route path="/patient/:id/chart" element={<ChartPage />} />

          <Route path="*" element={<Navigate to="/schedule" replace />} />
        </Routes>
      </ImagingToolbarProvider>
    </AiViewProvider>
  );
}
