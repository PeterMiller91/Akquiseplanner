"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { pct } from "@/lib/format";
import { Progress } from "@/components/ui";

export default function AufgabenPage() {
  const router = useRouter();
  const tasks = useStore((s) => s.tasks);
  const customers = useStore((s) => s.customers);
  const today = useStore((s) => s.today);
  const toggleTask = useStore((s) => s.toggleTask);

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;

  const todayTasks = tasks.filter((t) => t.due <= today);
  const weekTasks = tasks.filter((t) => t.due > today);

  const customerName = (id?: string | null) =>
    id ? (customers.find((c) => c.id === id)?.name ?? null) : null;

  const TaskCard = ({ t }: { t: typeof tasks[0] }) => {
    const cName = customerName(t.customerId);
    return (
      <button
        onClick={() => toggleTask(t.id)}
        className="w-full flex gap-3 items-start px-3.5 py-3 bg-surface border border-line rounded-sm2 text-left"
      >
        <span
          className="mt-[1px] w-5 h-5 flex-none rounded-md flex items-center justify-center text-[12px]"
          style={{
            border: `1.5px solid ${t.done ? "#2E5E46" : "#E3DDD0"}`,
            background: t.done ? "#2E5E46" : "transparent",
            color: "#FFF",
          }}
        >
          {t.done ? "✓" : ""}
        </span>
        <div className="flex-1 min-w-0">
          <span
            className="text-[14px] leading-snug block"
            style={{
              textDecoration: t.done ? "line-through" : "none",
              color: t.done ? "#646D5E" : "#1D2920",
            }}
          >
            {t.title}
          </span>
          {cName && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/kunden/${t.customerId}`);
              }}
              className="text-[12px] text-primary font-medium mt-0.5"
            >
              {cName}
            </button>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="pt-2">
        <div className="font-serif font-normal text-h1">Aufgaben</div>
        <div className="text-[13px] text-muted mt-0.5">
          {done} von {total} erledigt
        </div>
      </div>

      {/* Progress */}
      <Progress value={pct(done, total)} height={8} />

      {/* Heute group */}
      {todayTasks.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="text-[12px] font-semibold text-muted uppercase tracking-wider">Heute</div>
          {todayTasks.map((t) => <TaskCard key={t.id} t={t} />)}
        </section>
      )}

      {/* Diese Woche group */}
      {weekTasks.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="text-[12px] font-semibold text-muted uppercase tracking-wider">Diese Woche</div>
          {weekTasks.map((t) => <TaskCard key={t.id} t={t} />)}
        </section>
      )}

      {total === 0 && (
        <div className="bg-surface border border-line rounded-card px-4 py-8 text-center text-[13px] text-muted">
          Keine Aufgaben vorhanden
        </div>
      )}
    </div>
  );
}
