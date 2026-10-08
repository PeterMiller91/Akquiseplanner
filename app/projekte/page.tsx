"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { projectStats } from "@/lib/selectors";
import { eur, pct } from "@/lib/format";
import { STAGES } from "@/lib/types";
import { Avatar, Progress } from "@/components/ui";

export default function ProjektePage() {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const customers = useStore((s) => s.customers);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const formatDateRange = (start: string, end: string) => {
    const fmt = (iso: string) => {
      const d = new Date(iso);
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    };
    return `${fmt(start)} – ${fmt(end)}`;
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="pt-2">
        <div className="font-serif font-normal text-h1">Akquise-Projekte</div>
        <div className="text-[13px] text-muted mt-0.5">{projects.length} Projekte</div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {projects.map((p) => {
          const st = projectStats(p, customers);
          const isOpen = expanded === p.id;

          return (
            <div key={p.id} className="bg-surface border border-line rounded-card overflow-hidden">
              <div className="p-4 flex flex-col gap-3">
                {/* Sparte tag + date */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {p.sparten.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-semibold px-2 py-[3px] rounded-pill bg-tag-bg text-tag-ink"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11.5px] text-muted whitespace-nowrap">
                    {formatDateRange(p.start, p.end)}
                  </span>
                </div>

                {/* Name */}
                <div className="font-bold text-[16px] leading-snug">{p.name}</div>

                {/* Stats row */}
                <div className="flex gap-3">
                  <div className="flex-1 text-center">
                    <div className="font-serif text-[22px] font-normal">{st.leads}</div>
                    <div className="text-[11.5px] text-muted">Leads</div>
                  </div>
                  <div className="w-px bg-line" />
                  <div className="flex-1 text-center">
                    <div className="font-serif text-[22px] font-normal">{st.won}</div>
                    <div className="text-[11.5px] text-muted">Abschlüsse</div>
                  </div>
                  <div className="w-px bg-line" />
                  <div className="flex-1 text-center">
                    <div className="font-serif text-[22px] font-normal">{st.rate}%</div>
                    <div className="text-[11.5px] text-muted">Quote</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex flex-col gap-1.5">
                  <Progress value={pct(st.won, p.goalDeals)} height={6} />
                  <div className="flex justify-between text-[12px] text-muted">
                    <span>{st.won} von {p.goalDeals} Abschlüssen</span>
                    <span>{pct(st.won, p.goalDeals)}</span>
                  </div>
                </div>

                {/* Expand toggle */}
                {st.members.length > 0 && (
                  <button
                    onClick={() => toggle(p.id)}
                    className="text-[13px] font-semibold text-primary flex items-center gap-1"
                  >
                    {isOpen ? "Kunden ausblenden" : `${st.members.length} Kunden anzeigen`}
                    <svg
                      width="10" height="6" viewBox="0 0 10 6" fill="none"
                      style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                    >
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Expanded customer list */}
              {isOpen && (
                <div className="border-t border-line">
                  {st.members.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/kunden/${c.id}`)}
                      className="w-full flex gap-3 items-center px-4 py-[11px] border-b border-line last:border-b-0 text-left"
                    >
                      <Avatar name={c.name} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold truncate">{c.name}</div>
                        <div className="text-[12px] text-muted">{eur(c.expectedCourtage)}</div>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-[3px] rounded-pill bg-tag-bg text-tag-ink">
                        {STAGES[c.stage]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
