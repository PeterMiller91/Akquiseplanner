"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  courtageInMonth,
  dealsInMonth,
  eventsThisWeek,
  openCustomers,
} from "@/lib/selectors";
import { eur, pct, formatMonthYear } from "@/lib/format";
import { STAGES, SPARTEN } from "@/lib/types";
import type { Goal } from "@/lib/types";

function GoalBar({
  label,
  value,
  goal,
  fmt,
}: {
  label: string;
  value: number;
  goal: number;
  fmt: (n: number) => string;
}) {
  const p = pct(value, goal);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[13.5px] font-semibold text-ink">{label}</span>
        <span className="text-[12px] text-muted">
          {fmt(value)} / {fmt(goal)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-track overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-[width] duration-300" style={{ width: p }} />
      </div>
      <div className="text-[12px] text-muted">{p} erreicht</div>
    </div>
  );
}

export default function ZielePage() {
  const customers = useStore((s) => s.customers);
  const events = useStore((s) => s.events);
  const goal = useStore((s) => s.goal);
  const today = useStore((s) => s.today);
  const setGoal = useStore((s) => s.setGoal);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Pick<Goal, "courtage" | "deals" | "events" | "leads">>({
    courtage: goal.courtage,
    deals: goal.deals,
    events: goal.events,
    leads: goal.leads,
  });

  const openEdit = () => {
    setDraft({ courtage: goal.courtage, deals: goal.deals, events: goal.events, leads: goal.leads });
    setEditing(true);
  };

  const save = () => {
    setGoal(draft);
    setEditing(false);
  };

  const courtage = courtageInMonth(customers);
  const deals = dealsInMonth(customers);
  const weekEventCount = eventsThisWeek(events, today).length;
  const leadsCount = customers.length;

  const funnelCounts = STAGES.map((_, i) => customers.filter((c) => c.stage >= i).length);
  const funnelMax = funnelCounts[0] || 1;

  const sparteStats = SPARTEN.map((s) => {
    const sc = customers.filter((c) => c.sparte === s && c.stage < 5);
    return {
      sparte: s,
      count: sc.length,
      sum: sc.reduce((a, c) => a + c.expectedCourtage, 0),
    };
  }).filter((x) => x.count > 0);

  const sparteMax = Math.max(...sparteStats.map((x) => x.count), 1);

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="pt-2 flex justify-between items-start">
        <div>
          <div className="font-serif font-normal text-h1">Ziele</div>
          <div className="text-[13px] text-muted mt-0.5">{formatMonthYear(today)}</div>
        </div>
        <button
          onClick={openEdit}
          className="mt-1 w-[36px] h-[36px] rounded-[10px] border border-line bg-surface flex items-center justify-center"
          title="Ziele bearbeiten"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {/* Monthly goals */}
      <section className="bg-surface border border-line rounded-card p-4 flex flex-col gap-4">
        <div className="font-bold text-[15px]">Monatsziele</div>
        <GoalBar label="Courtage" value={courtage} goal={goal.courtage} fmt={eur} />
        <GoalBar label="Abschlüsse" value={deals} goal={goal.deals} fmt={(n) => `${n}`} />
        <GoalBar label="Termine" value={weekEventCount} goal={goal.events} fmt={(n) => `${n}`} />
        <GoalBar label="Neue Leads" value={leadsCount} goal={goal.leads} fmt={(n) => `${n}`} />
      </section>

      {/* Acquisition funnel */}
      <section className="bg-surface border border-line rounded-card p-4 flex flex-col gap-3">
        <div className="font-bold text-[15px]">Akquise-Trichter</div>
        {STAGES.map((label, i) => {
          const count = funnelCounts[i];
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[12.5px] text-muted w-[74px] flex-none">{label}</span>
              <div className="flex-1 h-[28px] bg-track rounded-[8px] overflow-hidden">
                <div
                  className="h-full bg-primary rounded-[8px] flex items-center justify-end pr-2 transition-[width] duration-300"
                  style={{ width: pct(count, funnelMax) }}
                >
                  {count > 0 && (
                    <span className="text-[12px] font-bold text-primary-ink">{count}</span>
                  )}
                </div>
              </div>
              {count === 0 && (
                <span className="text-[12px] text-muted w-[24px]">0</span>
              )}
            </div>
          );
        })}
      </section>

      {/* Pipeline by sparte */}
      {sparteStats.length > 0 && (
        <section className="bg-surface border border-line rounded-card p-4 flex flex-col gap-3">
          <div className="font-bold text-[15px]">Pipeline nach Sparte</div>
          {sparteStats.map(({ sparte, count, sum }) => (
            <div key={sparte} className="flex items-center gap-3">
              <span className="text-[12.5px] text-muted w-[90px] flex-none">{sparte}</span>
              <div className="flex-1 h-[28px] bg-track rounded-[8px] overflow-hidden">
                <div
                  className="h-full bg-tag-bg rounded-[8px] flex items-center justify-end pr-2 transition-[width] duration-300"
                  style={{ width: pct(count, sparteMax) }}
                >
                  {count > 0 && (
                    <span className="text-[12px] font-bold text-tag-ink">{count}</span>
                  )}
                </div>
              </div>
              <span className="text-[12px] text-muted w-[60px] text-right">{eur(sum)}</span>
            </div>
          ))}
        </section>
      )}

      <div className="h-4" />

      {/* Edit bottom sheet */}
      {editing && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}
        >
          <div className="w-full bg-bg rounded-t-[20px] px-5 pt-5 pb-8 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <div className="font-bold text-[17px]">Ziele bearbeiten</div>
              <button
                onClick={() => setEditing(false)}
                className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-surface border border-line text-muted text-[14px]"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {(
                [
                  { key: "courtage", label: "Courtage-Ziel (€)", min: 0 },
                  { key: "deals", label: "Abschlüsse", min: 0 },
                  { key: "events", label: "Termine", min: 0 },
                  { key: "leads", label: "Neue Leads", min: 0 },
                ] as const
              ).map(({ key, label, min }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink">{label}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={min}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: Math.max(min, Number(e.target.value) || 0) }))
                    }
                    className="h-[44px] bg-surface border border-line rounded-[12px] px-4 text-[15px] font-semibold text-ink outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={save}
              className="h-[48px] bg-primary text-primary-ink rounded-[14px] text-[15px] font-semibold"
            >
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
