"use client";

import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { STAGES, type StageIndex } from "@/lib/types";
import { eur, formatLongDate, formatTime, relativeFromNow } from "@/lib/format";
import { Avatar } from "@/components/ui";

const ACTIVITY_ICONS: Record<string, string> = {
  anruf: "📞",
  termin: "📅",
  mail: "✉️",
  phase: "→",
  notiz: "📝",
};

export default function KundenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const customers = useStore((s) => s.customers);
  const activities = useStore((s) => s.activities);
  const today = useStore((s) => s.today);
  const advanceStage = useStore((s) => s.advanceStage);
  const setStage = useStore((s) => s.setStage);

  const c = customers.find((x) => x.id === id);
  if (!c) {
    return (
      <div className="pt-10 text-center text-[14px] text-muted">
        Kunde nicht gefunden.{" "}
        <button onClick={() => router.back()} className="text-primary font-semibold">
          Zurück
        </button>
      </div>
    );
  }

  const cActivities = activities.filter((a) => a.customerId === id);

  const infoRows = [
    c.phone && { label: "Telefon", value: c.phone },
    c.email && { label: "E-Mail", value: c.email },
    c.source && { label: "Quelle", value: c.source },
    c.lastContactAt && { label: "Letzter Kontakt", value: relativeFromNow(c.lastContactAt, today) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Back */}
      <div className="pt-2 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-[13px] font-semibold text-primary flex items-center gap-1">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M6 1 1 6l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Übersicht
        </button>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={c.name} size={64} />
        <div>
          <div className="font-serif font-normal text-h1 leading-tight">{c.name}</div>
          <div className="flex justify-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[11.5px] font-semibold px-2.5 py-[4px] rounded-pill bg-tag-bg text-tag-ink">
              {c.sparte}
            </span>
            <span className="text-[11.5px] font-semibold px-2.5 py-[4px] rounded-pill border border-line text-muted">
              {eur(c.expectedCourtage)}
            </span>
          </div>
        </div>
      </div>

      {/* Phase stepper */}
      <div className="bg-surface border border-line rounded-card px-4 py-3">
        <div className="text-[11.5px] font-semibold text-muted uppercase tracking-wider mb-3">Phase</div>
        <div className="flex gap-1.5">
          {STAGES.map((label, i) => {
            const filled = i <= c.stage;
            const current = i === c.stage;
            return (
              <button
                key={i}
                onClick={() => setStage(c.id, i as StageIndex)}
                className="flex-1 h-[6px] rounded-full transition-colors"
                style={{ background: filled ? "#2E5E46" : "#E3DDD0" }}
                title={label}
              />
            );
          })}
        </div>
        <div className="text-[12px] text-muted mt-2">{STAGES[c.stage]}</div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {c.phone && (
          <a
            href={`tel:${c.phone}`}
            className="flex-1 h-[44px] bg-surface border border-line rounded-[12px] flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.58 1.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72a16 16 0 0 0 6.29 6.29l1.92-1.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Anrufen
          </a>
        )}
        <button
          onClick={() => advanceStage(c.id)}
          disabled={c.stage >= 5}
          className="flex-1 h-[44px] bg-primary text-primary-ink rounded-[12px] text-[13px] font-semibold disabled:opacity-40"
        >
          Phase weiter →
        </button>
      </div>

      {/* Next step */}
      {c.nextStep && (
        <div className="bg-surface border border-line rounded-card p-4">
          <div className="text-[11.5px] font-semibold text-muted uppercase tracking-wider mb-1.5">Nächster Schritt</div>
          <div className="text-[14px] font-semibold text-ink">{c.nextStep}</div>
        </div>
      )}

      {/* Info list */}
      <div className="bg-surface border border-line rounded-card overflow-hidden">
        {infoRows.map((row, i) => (
          <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-line last:border-b-0">
            <span className="text-[13px] text-muted">{row.label}</span>
            <span className="text-[13px] font-medium text-ink text-right max-w-[55%] truncate">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      {c.note && (
        <div className="bg-surface border border-line rounded-card p-4">
          <div className="text-[11.5px] font-semibold text-muted uppercase tracking-wider mb-1.5">Notiz</div>
          <div className="text-[13.5px] text-ink leading-relaxed">{c.note}</div>
        </div>
      )}

      {/* Activity timeline */}
      {cActivities.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="font-bold text-[15px]">Verlauf</div>
          <div className="flex flex-col gap-0">
            {cActivities.map((a, i) => (
              <div key={a.id} className="flex gap-3 relative">
                {/* line */}
                {i < cActivities.length - 1 && (
                  <div className="absolute left-[15px] top-7 bottom-0 w-[1px] bg-line" />
                )}
                <div className="flex-none w-[30px] h-[30px] rounded-full bg-tag-bg flex items-center justify-center text-[13px] mt-1.5">
                  {ACTIVITY_ICONS[a.type] ?? "·"}
                </div>
                <div className="flex-1 pb-3">
                  <div className="text-[13.5px] text-ink leading-snug">{a.text}</div>
                  <div className="text-[12px] text-muted mt-0.5">
                    {relativeFromNow(a.at, today)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="h-4" />
    </div>
  );
}
