/* eslint-disable react-refresh/only-export-components -- findings/treatments data lives with the logo components that consume it */
import { XRAY_IMAGES } from "./constants";

export interface Finding {
  toothNumber: number;
  location: string;
  treatment: string;
  bone: "Healthy" | "Mild" | "Moderate";
  damage: number;
  image: string;
}

export interface TreatmentExplainer {
  name: string;
  appliedTo: string;
  description: string;
}

export const FINDINGS: Finding[] = [
  {
    toothNumber: 30,
    location: "Lower Right Molar",
    treatment: "Crown",
    bone: "Mild",
    damage: 70,
    image: XRAY_IMAGES[0],
  },
  {
    toothNumber: 3,
    location: "Upper Right Incisor",
    treatment: "Filling",
    bone: "Healthy",
    damage: 15,
    image: XRAY_IMAGES[1],
  },
  {
    toothNumber: 4,
    location: "Upper Right Incisor",
    treatment: "Filling",
    bone: "Healthy",
    damage: 20,
    image: XRAY_IMAGES[2],
  },
  {
    toothNumber: 19,
    location: "Lower Left Molar",
    treatment: "Root Canal",
    bone: "Moderate",
    damage: 65,
    image: XRAY_IMAGES[3],
  },
  {
    toothNumber: 18,
    location: "Lower Left Molar",
    treatment: "Filling",
    bone: "Mild",
    damage: 35,
    image: XRAY_IMAGES[0],
  },
  {
    toothNumber: 14,
    location: "Upper Left Canine",
    treatment: "Filling",
    bone: "Healthy",
    damage: 25,
    image: XRAY_IMAGES[1],
  },
];

export const TREATMENTS: TreatmentExplainer[] = [
  {
    name: "Crown",
    appliedTo: "TOOTH 30",
    description:
      "A crown is a custom-made cap that covers a tooth to protect it after damage or after a root canal. It restores the tooth's shape, strength, and appearance.",
  },
  {
    name: "Filling",
    appliedTo: "TEETH 3, 4, 14, 18",
    description:
      "A filling repairs a small area of decay. The dentist removes the decayed portion and fills the space with a tooth-colored material to restore normal function.",
  },
  {
    name: "Root Canal",
    appliedTo: "TOOTH 19",
    description:
      "A root canal treats infection or inflammation inside a tooth. The dentist removes the damaged pulp, cleans the canal, and seals it.",
  },
];

export function VideaLogoHorizontal({ height = 18 }: { height?: number }) {
  return (
    <img
      src="/assets/preview/logo-videa-horizontal.svg"
      alt="Videa"
      style={{ height, width: "auto" }}
      className="block self-start"
    />
  );
}

export function VideaLogoStacked({ height = 40 }: { height?: number }) {
  return (
    <img
      src="/assets/preview/logo-videa-stacked.svg"
      alt="Videa"
      style={{ height, width: "auto" }}
      className="block"
    />
  );
}

export function StatusDot({ tone }: { tone: "good" | "warn" }) {
  const color = tone === "good" ? "#16a34a" : "#f59e0b";
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: 6, height: 6, backgroundColor: color }}
    />
  );
}
