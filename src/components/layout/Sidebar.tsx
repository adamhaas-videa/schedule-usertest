import videaLogoVert from "@/assets/icons/videa-vert-logo.svg";
import videaLogoHoriz from "@/assets/icons/videa-horizontal-logo.svg";
import { cn } from "@/lib/utils";

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

function ClinicalAssistIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={cn("shrink-0", className)}>
      <path d="M3 5.78125C3 3.6875 4.6875 2 6.78125 2C7.375 2 7.9375 2.125 8.46875 2.40625L10 3.15625L11.5312 2.40625C12.0625 2.125 12.625 2 13.2188 2C15.3125 2 17 3.6875 17 5.78125V8.0625C17 8.78125 16.8438 9.53125 16.5 10.1875L15.75 11.6562C15.5938 12.0312 15.4688 12.4062 15.4375 12.8125L15.125 16.125C15 17.1875 14.125 18 13.0625 18C12.0938 18 11.25 17.3125 11.0625 16.375L10.1562 12.125C10.1562 12.0625 10.0938 12 10 12C9.90625 12 9.84375 12.0625 9.84375 12.125L8.9375 16.375C8.75 17.3125 7.90625 18 6.9375 18C5.875 18 5 17.1875 4.90625 16.125L4.5625 12.8125C4.53125 12.4062 4.4375 12.0312 4.25 11.6562L3.5 10.1875C3.15625 9.53125 3 8.78125 3 8.0625V5.78125ZM6.78125 3.5C5.53125 3.5 4.5 4.53125 4.5 5.78125V8.0625C4.5 8.5625 4.625 9.0625 4.84375 9.5L5.59375 11C5.84375 11.5312 6 12.0938 6.0625 12.6875L6.375 16C6.40625 16.2812 6.65625 16.5 6.9375 16.5C7.1875 16.5 7.4375 16.3125 7.46875 16.0625L8.375 11.8438C8.53125 11.0625 9.21875 10.5 10 10.5C10.7812 10.5 11.4688 11.0625 11.625 11.8438L12.5312 16.0625C12.5625 16.3125 12.8125 16.5 13.0625 16.5C13.3438 16.5 13.5938 16.2812 13.625 16L13.9375 12.6875C14 12.0938 14.1562 11.5312 14.4062 11L15.1562 9.5C15.375 9.0625 15.5 8.5625 15.5 8.0625V5.78125C15.5 4.53125 14.4688 3.5 13.2188 3.5C12.875 3.5 12.5 3.59375 12.1875 3.75L10.3438 4.6875C10.125 4.78125 9.875 4.78125 9.65625 4.6875L7.8125 3.75C7.5 3.59375 7.15625 3.5 6.78125 3.5Z" fill="currentColor"/>
      <path d="M10 3L7.53125 2.1875C7.1875 2.0625 6.8125 2 6.4375 2C4.53125 2 3 3.53125 3 5.4375V7.59375C5.33333 8.02604 11.4 8.63125 17 7.59375V5.4375C17 3.53125 15.4688 2 13.5625 2C13.1875 2 12.8125 2.0625 12.4688 2.1875L10 3Z" fill="currentColor"/>
    </svg>
  );
}

function PerioIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={cn("shrink-0", className)} style={style}>
      <path d="M13.2009 11.4583V17.6705C13.2009 18.0588 12.8723 18.3873 12.4841 18.3873C12.0958 18.3873 11.7673 18.0588 11.7673 17.6705V11.4583C11.7673 11.07 12.0958 10.7415 12.4841 10.7415C12.8723 10.7415 13.2009 11.07 13.2009 11.4583ZM15.5902 12.414V16.7148C15.5902 17.1031 15.2617 17.4316 14.8734 17.4316C14.4851 17.4316 14.1566 17.1031 14.1566 16.7148V12.414C14.1566 12.0257 14.4851 11.6972 14.8734 11.6972C15.2617 11.6972 15.5902 12.0257 15.5902 12.414ZM10.8115 12.8919V16.2369C10.8115 16.6252 10.483 16.9537 10.0947 16.9537C9.70646 16.9537 9.37793 16.6252 9.37793 16.2369V12.8919C9.37793 12.5036 9.70646 12.1751 10.0947 12.1751C10.483 12.1751 10.8115 12.5036 10.8115 12.8919ZM17.9795 13.8476V15.2812C17.9795 15.6695 17.651 15.998 17.2627 15.998C16.8745 15.998 16.5459 15.6695 16.5459 15.2812V13.8476C16.5459 13.4593 16.8745 13.1308 17.2627 13.1308C17.651 13.1308 17.9795 13.4593 17.9795 13.8476Z" fill="currentColor"/>
      <path d="M11.7666 3C13.7675 3.00011 15.3797 4.61241 15.3799 6.61328V8.79395C15.3799 9.25833 15.3098 9.73566 15.1641 10.1904C14.8589 10.3374 14.2119 10.4671 13.8018 9.70801C13.8944 9.41403 13.9463 9.10429 13.9463 8.79395V6.61328C13.9461 5.41881 12.9611 4.4337 11.7666 4.43359C11.4383 4.43359 11.0798 4.52269 10.7812 4.67188L9.01855 5.56836C8.80952 5.6579 8.57035 5.65794 8.36133 5.56836L6.59961 4.67188C6.30106 4.5226 5.97249 4.43366 5.61426 4.43359C4.41968 4.43359 3.43375 5.41874 3.43359 6.61328V8.79395C3.43361 9.27177 3.55267 9.74987 3.76172 10.168L4.47852 11.6016C4.7174 12.1092 4.86701 12.6465 4.92676 13.2139L5.22559 16.3799C5.25545 16.6487 5.49487 16.8574 5.76367 16.8574C6.00245 16.8572 6.24066 16.6782 6.27051 16.4395L7.13672 12.4072C7.15117 12.335 7.17175 12.2652 7.19531 12.1973C7.54125 12.0297 8.34446 12.1311 8.53809 12.6855L7.6748 16.7383C7.49563 17.6341 6.68934 18.2908 5.76367 18.291C4.7482 18.291 3.91187 17.5145 3.82227 16.499L3.49316 13.334C3.4633 12.9457 3.37354 12.5869 3.19434 12.2285L2.47754 10.8252C2.14902 10.198 2.00002 9.48084 2 8.79395V6.61328C2.00015 4.61234 3.61328 3 5.61426 3C6.18151 3.00005 6.719 3.11903 7.22656 3.3877L8.69043 4.10449L10.1533 3.3877C10.6611 3.1189 11.1991 3 11.7666 3ZM12.1816 16.0967C12.1681 16.1714 12.1549 16.2494 12.1416 16.3291C12.1317 16.3886 12.1213 16.4493 12.1113 16.5107L12.0459 16.3711C12.1058 16.2354 12.1627 16.0749 12.2197 15.8955C12.2065 15.9595 12.1943 16.0268 12.1816 16.0967Z" fill="currentColor"/>
    </svg>
  );
}

const INACTIVE_COLOR = "#5C7890";

const navItems = [
  { icon: "clinical-assist", label: "Clinical Assist", active: true, custom: true },
  { icon: "chart", label: "Insights", faClass: "fa-regular fa-chart-mixed" },
  { icon: "microphone", label: "Voice Notes", faClass: "fa-regular fa-microphone" },
  { icon: "perio", label: "Voice Perio", custom: true },
  { icon: "file", label: "Clean Claims", faClass: "fa-regular fa-file-lines" },
  { icon: "shield", label: "Auto-Verify", faClass: "fa-regular fa-shield-check" },
];

function NavIcon({ item }: { item: (typeof navItems)[number] }) {
  if (item.icon === "clinical-assist") {
    return <ClinicalAssistIcon className="text-deep-teal" />;
  }
  if (item.icon === "perio") {
    return <PerioIcon style={{ color: INACTIVE_COLOR }} />;
  }
  return (
    <i
      className={cn("text-base shrink-0 w-5 text-center", item.faClass)}
      style={{ color: item.active ? undefined : INACTIVE_COLOR }}
    />
  );
}

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-200 ease-in-out",
        expanded ? "w-[208px] shadow-xl" : "w-14"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center shrink-0 h-[73px] px-2",
        expanded ? "px-4" : "justify-center"
      )}>
        {expanded ? (
          <img src={videaLogoHoriz} alt="Videa" className="h-8" />
        ) : (
          <img src={videaLogoVert} alt="Videa" className="w-[36px] h-[49px]" />
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col pt-6 px-2">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "group/nav relative flex items-center rounded-lg transition-colors",
                item.active ? "bg-gray-200" : "hover:bg-gray-100"
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 shrink-0">
                <NavIcon item={item} />
              </div>
              {expanded ? (
                <span
                  className="text-sm font-medium whitespace-nowrap pr-3"
                  style={{ color: item.active ? "#123C4D" : INACTIVE_COLOR }}
                >
                  {item.label}
                </span>
              ) : (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity duration-100 shadow-lg">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Expand/Collapse */}
      <div className="px-2 pb-4 flex">
        <button
          onClick={onToggle}
          className={cn(
            "group/nav relative flex items-center justify-center w-10 h-10 shrink-0",
            expanded && "ml-auto w-auto px-2"
          )}
        >
          <i
            className={cn(
              "fa-regular text-base text-muted-foreground",
              expanded ? "fa-square-chevron-left" : "fa-square-chevron-right"
            )}
          />
          {!expanded && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity duration-100 shadow-lg">
              Expand sidebar
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
