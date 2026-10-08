"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { relativeFromNow } from "@/lib/format";
import { STAGES, SPARTEN, type Sparte, type StageIndex } from "@/lib/types";
import { Avatar } from "@/components/ui";

// ── Swipe row ──────────────────────────────────────────────────────────────

const THRESHOLD = 72;
const MAX_DRAG = 112;

function SwipeRow({
  onDelete,
  onArchive,
  children,
}: {
  onDelete: () => void;
  onArchive: () => void;
  children: React.ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const axis = useRef<"h" | "v" | null>(null);

  const start = (x: number, y: number) => {
    startX.current = x;
    startY.current = y;
    dragging.current = true;
    axis.current = null;
  };

  const move = (x: number, y: number) => {
    if (!dragging.current) return;
    const dx = x - startX.current;
    const dy = y - startY.current;
    if (axis.current === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (axis.current === "v") return;
    setOffset(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx)));
  };

  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const o = offset;
    setOffset(0);
    if (axis.current === "h") {
      if (o < -THRESHOLD) onDelete();
      else if (o > THRESHOLD) onArchive();
    }
  };

  const cancel = () => {
    if (dragging.current) { dragging.current = false; setOffset(0); }
  };

  const progress = Math.min(1, Math.abs(offset) / THRESHOLD);
  const committed = Math.abs(offset) >= THRESHOLD;
  const goingLeft = offset < -4;
  const goingRight = offset > 4;

  return (
    <div className="relative overflow-hidden border-b border-line last:border-b-0">
      {/* Delete background — revealed on left swipe */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-5 gap-2 pointer-events-none"
        style={{
          background: committed
            ? "#C0392B"
            : `rgba(192,57,43,${0.5 + progress * 0.5})`,
          opacity: goingLeft ? 1 : 0,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        <span className="text-white text-[12.5px] font-semibold">Löschen</span>
      </div>

      {/* Archive background — revealed on right swipe */}
      <div
        className="absolute inset-0 flex items-center justify-start pl-5 gap-2 pointer-events-none"
        style={{
          background: committed
            ? "#5A7A5A"
            : `rgba(90,122,90,${0.5 + progress * 0.5})`,
          opacity: goingRight ? 1 : 0,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" rx="1" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
        <span className="text-white text-[12.5px] font-semibold">Archivieren</span>
      </div>

      {/* Sliding row content */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? "none" : "transform 0.22s ease",
          willChange: "transform",
        }}
        onTouchStart={(e) => start(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={end}
        onMouseDown={(e) => start(e.clientX, e.clientY)}
        onMouseMove={(e) => move(e.clientX, e.clientY)}
        onMouseUp={end}
        onMouseLeave={cancel}
      >
        {children}
      </div>
    </div>
  );
}

// ── Add-customer form ──────────────────────────────────────────────────────

type Draft = {
  name: string;
  type: "privat" | "gewerbe";
  sparte: Sparte;
  stage: StageIndex;
  expectedCourtage: string;
  nextStep: string;
  nextStepAt: string;
  phone: string;
  email: string;
  source: string;
  projectId: string | null;
  note: string;
};

const emptyDraft = (): Draft => ({
  name: "",
  type: "privat",
  sparte: "BU",
  stage: 0,
  expectedCourtage: "",
  nextStep: "",
  nextStepAt: "",
  phone: "",
  email: "",
  source: "",
  projectId: null,
  note: "",
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-muted uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "h-[44px] bg-surface border border-line rounded-[12px] px-4 text-[14px] text-ink outline-none focus:border-primary placeholder:text-muted";

// ── Page ──────────────────────────────────────────────────────────────────

export default function KundenPage() {
  const router = useRouter();
  const customers = useStore((s) => s.customers);
  const projects = useStore((s) => s.projects);
  const today = useStore((s) => s.today);
  const addCustomer = useStore((s) => s.addCustomer);
  const deleteCustomer = useStore((s) => s.deleteCustomer);
  const archiveCustomer = useStore((s) => s.archiveCustomer);

  const [query, setQuery] = useState("");
  const [sparte, setSparte] = useState<Sparte | "Alle">("Alle");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [showArchived, setShowArchived] = useState(false);

  const active = useMemo(() => customers.filter((c) => !c.archived), [customers]);
  const archived = useMemo(() => customers.filter((c) => c.archived), [customers]);

  const filtered = useMemo(() => {
    const source = showArchived ? archived : active;
    const q = query.toLowerCase().trim();
    return source.filter((c) => {
      const matchSparte = sparte === "Alle" || c.sparte === sparte;
      const matchQuery =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.sparte.toLowerCase().includes(q);
      return matchSparte && matchQuery;
    });
  }, [active, archived, showArchived, query, sparte]);

  const allSparten = ["Alle", ...SPARTEN] as const;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const canSave = draft.name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addCustomer({
      name: draft.name.trim(),
      type: draft.type,
      sparte: draft.sparte,
      stage: draft.stage,
      expectedCourtage: Number(draft.expectedCourtage) || 0,
      nextStep: draft.nextStep.trim(),
      nextStepAt: draft.nextStepAt || undefined,
      phone: draft.phone.trim() || undefined,
      email: draft.email.trim() || undefined,
      source: draft.source.trim() || undefined,
      projectId: draft.projectId,
      note: draft.note.trim() || undefined,
      lastContactAt: undefined,
    });
    setAdding(false);
    setDraft(emptyDraft());
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="pt-2 flex justify-between items-center">
        <div className="font-serif font-normal text-h1">Kunden</div>
        <button
          onClick={() => { setDraft(emptyDraft()); setAdding(true); }}
          className="w-[36px] h-[36px] rounded-[10px] border border-line bg-surface flex items-center justify-center"
          title="Neuen Kunden anlegen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-[44px] bg-surface border border-line rounded-[12px] pl-9 pr-4 text-[14px] text-ink placeholder:text-muted outline-none focus:border-primary"
        />
      </div>

      {/* Sparte filter chips */}
      <div className="flex gap-2 overflow-x-auto -mx-[18px] px-[18px] pb-0.5 no-scrollbar">
        {allSparten.map((s) => {
          const active2 = sparte === s;
          return (
            <button
              key={s}
              onClick={() => setSparte(s as typeof sparte)}
              className="flex-none rounded-pill text-[12.5px] font-semibold px-3 py-[7px] transition-colors"
              style={{
                background: active2 ? "#2E5E46" : "#FFFDF8",
                color: active2 ? "#FFFFFF" : "#1D2920",
                border: "1px solid " + (active2 ? "#2E5E46" : "#E3DDD0"),
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Archive toggle */}
      {archived.length > 0 && (
        <button
          onClick={() => setShowArchived((v) => !v)}
          className="self-start text-[12.5px] font-semibold text-primary flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" rx="1" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          {showArchived ? "Aktive Kunden" : `Archiv (${archived.length})`}
        </button>
      )}

      {/* List */}
      <div className="bg-surface border border-line rounded-card overflow-hidden">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-muted">
            {showArchived ? "Kein Archiv vorhanden" : "Keine Kunden gefunden"}
          </div>
        )}
        {filtered.map((c) => (
          <SwipeRow
            key={c.id}
            onDelete={() => deleteCustomer(c.id)}
            onArchive={() => archiveCustomer(c.id)}
          >
            <button
              onClick={() => router.push(`/kunden/${c.id}`)}
              className="w-full flex gap-3 items-center px-4 py-[13px] text-left bg-surface"
            >
              <Avatar name={c.name} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14.5px] truncate">{c.name}</div>
                <div className="text-[12px] text-muted truncate">
                  {c.sparte} · {c.lastContactAt ? relativeFromNow(c.lastContactAt, today) : "—"}
                </div>
              </div>
              <span className="flex-none text-[11px] font-semibold px-2 py-[3px] rounded-pill bg-tag-bg text-tag-ink">
                {STAGES[c.stage]}
              </span>
            </button>
          </SwipeRow>
        ))}
      </div>

      {/* Add customer overlay */}
      {adding && (
        <div className="absolute inset-0 z-50 flex flex-col bg-bg" style={{ overflowY: "auto" }}>
          <div className="sticky top-0 z-10 bg-bg flex justify-between items-center px-5 pt-5 pb-3 border-b border-line">
            <div className="font-bold text-[17px]">Neuer Kunde</div>
            <button
              onClick={() => setAdding(false)}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-surface border border-line text-muted text-[14px]"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 px-5 py-5 flex flex-col gap-5">
            <Field label="Name *">
              <input type="text" placeholder="z. B. Jonas Weber" value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputCls} autoFocus />
            </Field>

            <Field label="Kundentyp">
              <div className="flex gap-2">
                {(["privat", "gewerbe"] as const).map((t) => (
                  <button key={t} onClick={() => set("type", t)} className="flex-1 h-[40px] rounded-[10px] text-[13.5px] font-semibold"
                    style={{ background: draft.type === t ? "#2E5E46" : "#FFFDF8", color: draft.type === t ? "#FFF" : "#1D2920", border: "1px solid " + (draft.type === t ? "#2E5E46" : "#E3DDD0") }}>
                    {t === "privat" ? "Privat" : "Gewerbe"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Sparte">
              <div className="flex flex-wrap gap-2">
                {SPARTEN.map((s) => (
                  <button key={s} onClick={() => set("sparte", s)} className="rounded-pill text-[12.5px] font-semibold px-3 py-[7px]"
                    style={{ background: draft.sparte === s ? "#2E5E46" : "#FFFDF8", color: draft.sparte === s ? "#FFF" : "#1D2920", border: "1px solid " + (draft.sparte === s ? "#2E5E46" : "#E3DDD0") }}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Phase">
              <div className="flex flex-wrap gap-2">
                {STAGES.slice(0, 5).map((label, i) => (
                  <button key={i} onClick={() => set("stage", i as StageIndex)} className="rounded-pill text-[12.5px] font-semibold px-3 py-[7px]"
                    style={{ background: draft.stage === i ? "#2E5E46" : "#FFFDF8", color: draft.stage === i ? "#FFF" : "#1D2920", border: "1px solid " + (draft.stage === i ? "#2E5E46" : "#E3DDD0") }}>
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Erwartete Courtage (€)">
              <input type="number" inputMode="numeric" min={0} placeholder="z. B. 1200" value={draft.expectedCourtage} onChange={(e) => set("expectedCourtage", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Nächster Schritt">
              <input type="text" placeholder="z. B. Erstgespräch · Mo 09:00" value={draft.nextStep} onChange={(e) => set("nextStep", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Datum / Uhrzeit (optional)">
              <input type="datetime-local" value={draft.nextStepAt} onChange={(e) => set("nextStepAt", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Telefon (optional)">
              <input type="tel" placeholder="z. B. 0171 234 5678" value={draft.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
            </Field>

            <Field label="E-Mail (optional)">
              <input type="email" placeholder="z. B. name@mail.de" value={draft.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Quelle (optional)">
              <input type="text" placeholder="z. B. Empfehlung, LinkedIn, Kaltakquise" value={draft.source} onChange={(e) => set("source", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Projekt (optional)">
              <div className="flex flex-col gap-1.5">
                <button onClick={() => set("projectId", null)} className="h-[40px] rounded-[12px] text-[13.5px] font-semibold text-left px-4"
                  style={{ background: draft.projectId === null ? "#2E5E46" : "#FFFDF8", color: draft.projectId === null ? "#FFF" : "#646D5E", border: "1px solid " + (draft.projectId === null ? "#2E5E46" : "#E3DDD0") }}>
                  Kein Projekt
                </button>
                {projects.map((p) => (
                  <button key={p.id} onClick={() => set("projectId", p.id)} className="h-[40px] rounded-[12px] text-[13.5px] font-semibold text-left px-4 truncate"
                    style={{ background: draft.projectId === p.id ? "#2E5E46" : "#FFFDF8", color: draft.projectId === p.id ? "#FFF" : "#1D2920", border: "1px solid " + (draft.projectId === p.id ? "#2E5E46" : "#E3DDD0") }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Notiz (optional)">
              <textarea placeholder="Hintergrundinformationen, Besonderheiten…" value={draft.note} onChange={(e) => set("note", e.target.value)} rows={4}
                className="bg-surface border border-line rounded-[12px] px-4 py-3 text-[14px] text-ink outline-none focus:border-primary placeholder:text-muted resize-none" />
            </Field>
          </div>

          <div className="sticky bottom-0 bg-bg px-5 pt-3 pb-6 border-t border-line">
            <button onClick={handleSave} disabled={!canSave} className="w-full h-[48px] bg-primary text-primary-ink rounded-[14px] text-[15px] font-semibold disabled:opacity-40">
              Kunde anlegen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
