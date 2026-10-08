"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { eventsOnDay } from "@/lib/selectors";
import {
  addDays,
  dateKey,
  formatMonthYear,
  formatTime,
  isoCalendarWeek,
  startOfISOWeek,
  weekdayShort,
} from "@/lib/format";

const STRIP_DAYS = 7;

export default function TerminePage() {
  const router = useRouter();
  const events = useStore((s) => s.events);
  const customers = useStore((s) => s.customers);
  const today = useStore((s) => s.today);

  const [selectedDay, setSelectedDay] = useState(today);

  const weekStart = startOfISOWeek(selectedDay);
  const days = Array.from({ length: STRIP_DAYS }, (_, i) => addDays(weekStart, i));

  const kw = isoCalendarWeek(selectedDay);
  const dayEvents = eventsOnDay(events, selectedDay);

  const hasEvent = (day: string) => events.some((e) => dateKey(e.start) === day);

  const goWeek = (dir: -1 | 1) => {
    setSelectedDay((d) => addDays(d, dir * 7));
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="pt-2 flex justify-between items-end">
        <div>
          <div className="font-serif font-normal text-h1">Termine</div>
          <div className="text-[13px] text-muted mt-0.5">
            {formatMonthYear(selectedDay)} · KW {kw}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => goWeek(-1)}
            className="w-[36px] h-[36px] rounded-[10px] border border-line bg-surface flex items-center justify-center"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M6 1 1 6l5 5" stroke="#1D2920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => goWeek(1)}
            className="w-[36px] h-[36px] rounded-[10px] border border-line bg-surface flex items-center justify-center"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1l5 5-5 5" stroke="#1D2920" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Week strip */}
      <div className="bg-surface border border-line rounded-card px-3 py-3">
        <div className="flex justify-between">
          {days.map((day) => {
            const isSelected = day === selectedDay;
            const isToday = day === today;
            const dot = hasEvent(day);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="flex flex-col items-center gap-1 w-[38px] py-1.5 rounded-[10px] transition-colors"
                style={{
                  background: isSelected ? "#2E5E46" : "transparent",
                }}
              >
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "#646D5E" }}
                >
                  {weekdayShort(day)}
                </span>
                <span
                  className="text-[15px] font-bold"
                  style={{ color: isSelected ? "#FFF" : isToday ? "#2E5E46" : "#1D2920" }}
                >
                  {new Date(day).getDate()}
                </span>
                <span
                  className="w-[5px] h-[5px] rounded-full"
                  style={{
                    background: dot
                      ? isSelected
                        ? "rgba(255,255,255,0.6)"
                        : "#2E5E46"
                      : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Event list */}
      <div className="bg-surface border border-line rounded-card overflow-hidden">
        {dayEvents.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-muted">
            Keine Termine – Zeit für Akquise-Anrufe
          </div>
        )}
        {dayEvents.map((e) => {
          const c = customers.find((x) => x.id === e.customerId);
          return (
            <button
              key={e.id}
              onClick={() => c && router.push(`/kunden/${c.id}`)}
              className="w-full flex gap-3.5 items-center px-4 py-[13px] border-b border-line last:border-b-0 text-left"
            >
              <div className="text-[13px] font-bold w-[42px] tabular-nums text-ink">
                {formatTime(e.start)}
              </div>
              <div className="w-[3px] self-stretch rounded bg-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate text-ink">{e.title}</div>
                <div className="text-[12px] text-muted truncate">
                  {c?.name ?? "—"}
                  {e.place ? ` · ${e.place}` : ""}
                </div>
              </div>
              <div className="text-[12px] text-muted whitespace-nowrap">
                {e.durationMin} Min.
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
