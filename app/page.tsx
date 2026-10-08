"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { useStore } from "@/lib/store";
import {
  courtageInMonth,
  daysLeftInMonth,
  eventsOnDay,
  eventsThisWeek,
  openCustomers,
  openTasks,
  projectStats,
} from "@/lib/selectors";
import { eur, pct, formatLongDate, formatTime } from "@/lib/format";
import { SEED_GOAL } from "@/lib/seed";

export default function StartPage() {
  const router = useRouter();
  const customers = useStore((s) => s.customers);
  const events = useStore((s) => s.events);
  const tasks = useStore((s) => s.tasks);
  const projects = useStore((s) => s.projects);
  const goal = useStore((s) => s.goal);
  const today = useStore((s) => s.today);
  const toggleTask = useStore((s) => s.toggleTask);

  const courtage = courtageInMonth(customers);
  const goalC = goal.courtage || SEED_GOAL.courtage;
  const todayEvents = eventsOnDay(events, today);
  const weekEvents = eventsThisWeek(events, today);
  const openTs = openTasks(tasks);
  const taskPreview = openTs.slice(0, 3);
  const remaining = daysLeftInMonth(today);

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <div className="text-[13px] text-muted">{formatLongDate(today)}</div>
          <div className="font-serif font-normal text-h1">Guten Morgen</div>
        </div>
        <UserMenu />
      </div>

      {/* Hero */}
      <button
        onClick={() => router.push("/ziele")}
        className="text-left bg-hero text-hero-ink rounded-card p-5 flex flex-col gap-2.5"
      >
        <div className="flex justify-between text-[13px] text-hero-muted">
          <span>Courtage Oktober</span>
          <span>Ziel {eur(goalC)}</span>
        </div>
        <div className="font-serif font-normal text-hero">{eur(courtage)}</div>
        <div className="h-2 rounded-full bg-hero-track overflow-hidden">
          <div
            className="h-full bg-accent-gold rounded-full transition-[width] duration-500"
            style={{ width: pct(courtage, goalC) }}
          />
        </div>
        <div className="flex justify-between text-[12px] text-hero-muted">
          <span>{pct(courtage, goalC)} erreicht</span>
          <span>noch {remaining} Tage</span>
        </div>
      </button>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <Link
          href="/pipeline"
          className="bg-surface border border-line rounded-sm2 p-3"
        >
          <div className="font-serif font-normal text-kpi">
            {openCustomers(customers).length}
          </div>
          <div className="text-[11.5px] text-muted mt-1.5">Offene Kontakte</div>
        </Link>
        <Link
          href="/termine"
          className="bg-surface border border-line rounded-sm2 p-3"
        >
          <div className="font-serif font-normal text-kpi">
            {weekEvents.length}
          </div>
          <div className="text-[11.5px] text-muted mt-1.5">
            Termine diese Woche
          </div>
        </Link>
        <Link
          href="/aufgaben"
          className="bg-surface border border-line rounded-sm2 p-3"
        >
          <div className="font-serif font-normal text-kpi">{openTs.length}</div>
          <div className="text-[11.5px] text-muted mt-1.5">Aufgaben offen</div>
        </Link>
      </div>

      {/* Heute */}
      <section className="flex flex-col gap-2.5">
        <div className="flex justify-between items-baseline">
          <div className="font-bold text-[15px]">Heute</div>
          <Link
            href="/termine"
            className="text-[13px] font-semibold text-primary"
          >
            Kalender
          </Link>
        </div>
        <div className="bg-surface border border-line rounded-card overflow-hidden">
          {todayEvents.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px] text-muted">
              Keine Termine heute
            </div>
          )}
          {todayEvents.map((e) => {
            const c = customers.find((x) => x.id === e.customerId);
            return (
              <Link
                key={e.id}
                href={c ? `/kunden/${c.id}` : "/termine"}
                className="flex gap-3.5 items-center px-4 py-[13px] border-b border-line last:border-b-0"
              >
                <div className="text-[13px] font-bold w-[42px] tabular-nums">
                  {formatTime(e.start)}
                </div>
                <div className="w-[3px] self-stretch rounded bg-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate">
                    {e.title}
                  </div>
                  <div className="text-[12px] text-muted truncate">
                    {c?.name ?? "—"} · {e.place ?? ""}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Aufgaben Preview */}
      <section className="flex flex-col gap-2.5">
        <div className="flex justify-between items-baseline">
          <div className="font-bold text-[15px]">Aufgaben</div>
          <Link
            href="/aufgaben"
            className="text-[13px] font-semibold text-primary"
          >
            Alle
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {taskPreview.length === 0 && (
            <div className="px-4 py-5 bg-surface border border-line rounded-sm2 text-center text-[13px] text-muted">
              Alle Aufgaben erledigt
            </div>
          )}
          {taskPreview.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className="flex gap-3 items-center px-3.5 py-3 bg-surface border border-line rounded-sm2 text-left"
            >
              <span
                className="w-5 h-5 flex-none rounded-md flex items-center justify-center text-[12px]"
                style={{
                  border: `1.5px solid ${t.done ? "#2E5E46" : "#E3DDD0"}`,
                  background: t.done ? "#2E5E46" : "transparent",
                  color: "#FFF",
                }}
              >
                {t.done ? "✓" : ""}
              </span>
              <span
                className="flex-1 text-[14px]"
                style={{
                  textDecoration: t.done ? "line-through" : "none",
                  color: t.done ? "#646D5E" : "#1D2920",
                }}
              >
                {t.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Projekte Karussell */}
      <section className="flex flex-col gap-2.5">
        <div className="flex justify-between items-baseline">
          <div className="font-bold text-[15px]">Akquise-Projekte</div>
          <Link
            href="/projekte"
            className="text-[13px] font-semibold text-primary"
          >
            Alle
          </Link>
        </div>
        <div className="flex gap-2.5 overflow-x-auto -mx-[18px] px-[18px] pb-1 no-scrollbar">
          {projects.map((p) => {
            const st = projectStats(p, customers);
            return (
              <Link
                key={p.id}
                href="/projekte"
                className="flex-none w-[200px] bg-surface border border-line rounded-card p-3.5 flex flex-col gap-2.5"
              >
                <span className="self-start text-[11px] font-semibold px-2 py-[3px] rounded-pill bg-tag-bg text-tag-ink">
                  {p.sparten.join(" · ")}
                </span>
                <div className="text-[14px] font-bold leading-tight">
                  {p.name}
                </div>
                <div className="h-[5px] rounded-full bg-track overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: pct(st.won, p.goalDeals) }}
                  />
                </div>
                <div className="text-[12px] text-muted">
                  {st.won} von {p.goalDeals} Abschlüssen
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
