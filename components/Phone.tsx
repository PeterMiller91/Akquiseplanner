import BottomNav from "./BottomNav";

export default function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-frame">
      <div className="phone-inner bg-bg text-ink font-sans flex flex-col">
        {/* iOS-Status-Leiste nur auf Desktop sichtbar */}
        <div className="hidden sm:flex h-11 flex-none items-center justify-between px-7 text-[14px] font-semibold text-ink/90">
          <span>9:41</span>
          <div className="w-24 h-[26px] rounded-[14px] bg-[#0d0d0f]" />
          <span className="inline-block w-4 h-[9px] border-[1.5px] border-current rounded-[3px]" />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-[18px] pb-6 pt-1 scroll-area">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
