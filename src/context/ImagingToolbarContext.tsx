import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_FINDING_TYPES,
  DEFAULT_THRESHOLD,
  type DisplayThreshold,
  type FindingTypes,
  type ImageAdjustments,
  type ToolbarMenuId,
} from "@/lib/imagingToolbar";

interface ImagingToolbarState {
  /** Which L2 is pinned open. Survives image and FMX ↔ single-image navigation. */
  openMenu: ToolbarMenuId | null;
  setOpenMenu: (id: ToolbarMenuId | null) => void;
  findingTypes: FindingTypes;
  setFindingTypes: (next: FindingTypes) => void;
  threshold: DisplayThreshold;
  setThreshold: (next: DisplayThreshold) => void;
  qualityFindings: boolean;
  setQualityFindings: (on: boolean) => void;
  adjustmentsFor: (slot: number) => ImageAdjustments;
  patchAdjustments: (slot: number, patch: Partial<ImageAdjustments>) => void;
  resetAdjustments: (slot: number) => void;
}

const ImagingToolbarContext = createContext<ImagingToolbarState | null>(null);

export function ImagingToolbarProvider({ children }: { children: ReactNode }) {
  const [openMenu, setOpenMenu] = useState<ToolbarMenuId | null>(null);
  const [findingTypes, setFindingTypes] = useState<FindingTypes>(
    DEFAULT_FINDING_TYPES
  );
  const [threshold, setThreshold] =
    useState<DisplayThreshold>(DEFAULT_THRESHOLD);
  const [qualityFindings, setQualityFindings] = useState(false);
  const [bySlot, setBySlot] = useState<Record<number, ImageAdjustments>>({});

  const adjustmentsFor = useCallback(
    (slot: number) => bySlot[slot] ?? DEFAULT_ADJUSTMENTS,
    [bySlot]
  );

  const patchAdjustments = useCallback(
    (slot: number, patch: Partial<ImageAdjustments>) => {
      setBySlot((prev) => {
        const current = prev[slot] ?? DEFAULT_ADJUSTMENTS;
        return { ...prev, [slot]: { ...current, ...patch } };
      });
    },
    []
  );

  const resetAdjustments = useCallback((slot: number) => {
    setBySlot((prev) => {
      if (!(slot in prev)) return prev;
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      openMenu,
      setOpenMenu,
      findingTypes,
      setFindingTypes,
      threshold,
      setThreshold,
      qualityFindings,
      setQualityFindings,
      adjustmentsFor,
      patchAdjustments,
      resetAdjustments,
    }),
    [
      openMenu,
      findingTypes,
      threshold,
      qualityFindings,
      adjustmentsFor,
      patchAdjustments,
      resetAdjustments,
    ]
  );

  return (
    <ImagingToolbarContext.Provider value={value}>
      {children}
    </ImagingToolbarContext.Provider>
  );
}

export function useImagingToolbar() {
  const ctx = useContext(ImagingToolbarContext);
  if (!ctx) {
    throw new Error(
      "useImagingToolbar must be used within an ImagingToolbarProvider"
    );
  }
  return ctx;
}
