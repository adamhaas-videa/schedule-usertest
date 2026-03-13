export default function L1Header() {
  return (
    <div className="h-[60px] bg-white border-b border-slate-200 flex items-center gap-6 px-4 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-deep-teal whitespace-nowrap">
          Clinical Assist
        </span>
      </div>

      <div className="flex-1 flex items-center justify-end gap-4">
        <span className="text-base font-medium text-slate-800 whitespace-nowrap">
          Demo Practice
        </span>

        <div className="flex items-center gap-0.5">
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            title="Documentation"
          >
            <i className="fa-regular fa-book-open text-muted-foreground text-base" />
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            title="Help"
          >
            <i className="fa-regular fa-circle-question text-muted-foreground text-base" />
          </button>
        </div>

        <div
          className="w-9 h-9 rounded-sm bg-periwinkle flex items-center justify-center overflow-hidden flex-shrink-0"
        >
          <span className="text-base font-semibold text-deep-teal leading-none">
            AH
          </span>
        </div>
      </div>
    </div>
  );
}
