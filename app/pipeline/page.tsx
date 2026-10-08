"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { pipelinePotential } from "@/lib/selectors";
import { eur, pct } from "@/lib/format";
import { STAGES, type StageIndex } from "@/lib/types";
import { Avatar } from "@/components/ui";

const STAGE_COLORS = [
  "#7BAFD4",
  "#6BBFA0",
  "#F0B84D",
  "#E07B4A",
  "#A47CC0",
  "#2E5E46",
];

export default function PipelinePage() {
  const router = useRouter();
  const customers = useStore((s) => s.customers);
  const advanceStage = useStore((s) => s.advanceStage);
  const [activeStage, setActiveStage] = useState<StageIndex>(0);

  const open = customers.filter((c) => c.stage < 5);
  const potential = pipelinePotential(customers);
  const stageCounts = STAGES.map((_, i) => open.filter((c) => c.stage === i).length);
  const total = open.length || 1;
  const stageCustomers = open.filter((c) => c.stage === activeStage);

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="pt-2">
        <div className="font-serif font-normal text-h1">Pipeline</div>
        <div className="text-[13px] text-muted mt-0.5">
          {open.length} Kontakte · {eur(potential)} Potenzial
        </div>
      </div>

      {/* Segment bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-[2px]">
        {STAGES.slice(0, 5).map((_, i) => {
          if (stageCounts[i] === 0) return null;
          return (
            <div
              key={i}
              className="h-full rounded-full"
              style={{ width: pct(stageCounts[i], total), background: STAGE_COLORS[i], flexShrink: 0 }}
            />
          );
        })}
      </div>

      {/* Phase chips */}
      <div className="flex gap-2 overflow-x-auto -mx-[18px] px-[18px] pb-0.5 no-scrollbar">
        {STAGES.slice(0, 5).map((label, i) => {
          const active = activeStage === i;
          return (
            <button
              key={i}
              onClick={() => setActiveStage(i as StageIndex)}
              className="flex-none flex items-center gap-1.5 rounded-pill text-[12.5px] font-semibold px-3 py-[7px] transition-colors"
              style={{
                background: active ? "#2E5E46" : "#FFFDF8",
                color: active ? "#FFFFFF" : "#1D2920",
                border: "1px solid " + (active ? "#2E5E46" : "#E3DDD0"),
              }}
            >
              {label}
              <span
                className="rounded-full px-[6px] py-[1px] text-[11px] font-bold"
                style={{
                  background: active ? "rgba(255,255,255,0.2)" : "#F3F0E9",
                  color: active ? "#FFF" : "#646D5E",
                }}
              >
                {stageCounts[i]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customer cards */}
      <div className="flex flex-col gap-3">
        {stageCustomers.length === 0 && (
          <div className="bg-surface border border-line rounded-card px-4 py-8 text-center text-[13px] text-muted">
            Keine Kunden in dieser Phase
          </div>
        )}
        {stageCustomers.map((c) => {
          const nextStage = STAGES[Math.min(5, c.stage + 1)];
          return (
            <div key={c.id} className="bg-surface border border-line rounded-card p-4 flex flex-col gap-3">
              <div className="flex gap-3 items-center">
                <Avatar name={c.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px] truncate">{c.name}</div>
                  <div className="text-[12px] text-muted truncate">
                    {c.sparte} · {eur(c.expectedCourtage)}
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-[3px] rounded-pill bg-tag-bg text-tag-ink whitespace-nowrap">
                  {STAGES[c.stage]}
                </span>
              </div>

              {c.nextStep && (
                <div className="text-[13px] text-muted bg-[#F3F0E9] rounded-[10px] px-3 py-2 leading-snug">
                  {c.nextStep}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/kunden/${c.id}`)}
                  className="flex-1 h-[38px] rounded-[10px] border border-line text-[13px] font-semibold text-ink"
                >
                  Details
                </button>
                {c.stage < 4 && (
                  <button
                    onClick={() => advanceStage(c.id)}
                    className="flex-1 h-[38px] rounded-[10px] bg-primary text-primary-ink text-[13px] font-semibold"
                  >
                    Weiter zu {nextStage} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
