import { useState, useRef, useEffect } from "react";
import type { Patient } from "@/data/mockPatients";
import { mockPatients } from "@/data/mockPatients";

interface SearchFieldProps {
  onSelectPatient: (patient: Patient) => void;
}

const recentSearches = [
  mockPatients[1],
  mockPatients[4],
  mockPatients[8],
];

export default function SearchField({ onSelectPatient }: SearchFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="bg-white border border-zinc-200 rounded-md flex items-center gap-2 h-10 px-3 overflow-hidden">
        <i className="fa-regular fa-magnifying-glass text-muted-foreground text-sm shrink-0" />
        <input
          type="text"
          placeholder="Search"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg bg-popover shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="py-1">
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Recent Searches
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
