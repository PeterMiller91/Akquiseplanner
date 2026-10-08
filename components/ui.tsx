import { initials } from "@/lib/format";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="font-bold text-[15px]">{title}</div>
      {action}
    </div>
  );
}

export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <div
      className="flex-none rounded-full bg-tag-bg text-tag-ink flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size * 0.33 }}
    >
      {initials(name)}
    </div>
  );
}

export function Chip({
  children,
  active = false,
  outlined = true,
}: {
  children: React.ReactNode;
  active?: boolean;
  outlined?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill text-[12.5px] font-semibold px-3 py-[7px]"
      style={{
        background: active ? "#2E5E46" : "#FFFDF8",
        color: active ? "#FFFFFF" : "#1D2920",
        border: outlined ? "1px solid " + (active ? "#2E5E46" : "#E3DDD0") : "none",
      }}
    >
      {children}
    </span>
  );
}

export function Progress({
  value,
  trackClass = "bg-track",
  fillClass = "bg-primary",
  height = 8,
}: {
  value: string; // "63%"
  trackClass?: string;
  fillClass?: string;
  height?: number;
}) {
  return (
    <div
      className={`rounded-full overflow-hidden ${trackClass}`}
      style={{ height }}
    >
      <div
        className={`h-full ${fillClass} transition-[width] duration-300`}
        style={{ width: value }}
      />
    </div>
  );
}

export function Card({
  children,
  className = "",
  as = "div",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "button";
  onClick?: () => void;
}) {
  const Comp: any = as;
  return (
    <Comp
      onClick={onClick}
      className={`bg-surface border border-line rounded-card ${
        onClick ? "cursor-pointer text-left" : ""
      } ${className}`}
    >
      {children}
    </Comp>
  );
}
