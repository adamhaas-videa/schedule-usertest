import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/data/mockPatients";
import { mockPatients } from "@/data/mockPatients";

interface SearchFieldProps {
  onSelectPatient: (patient: Patient) => void;
}

const recentSearches = [mockPatients[1], mockPatients[4], mockPatients[8]];

export default function SearchField({ onSelectPatient }: SearchFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <i
        className="fa-regular fa-magnifying-glass text-muted-foreground text-[12px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search patients"
        className="h-8 pl-8 bg-card"
        onFocus={() => setOpen(true)}
      />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg bg-popover shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="py-1">
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Recent searches
            </div>
            {recentSearches.map((patient) => (
              <button
                key={patient.id}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectPatient(patient);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{patient.name}</span>
                <span className="text-muted-foreground text-xs">
                  {patient.procedure}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
