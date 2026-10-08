export const STAGES = ["Lead", "Kontakt", "Termin", "Analyse", "Angebot", "Abschluss"] as const;
export type Stage = (typeof STAGES)[number];
export type StageIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const SPARTEN = ["BU", "Altersvorsorge", "Investment", "bKV", "Strom", "Gas"] as const;
export type Sparte = (typeof SPARTEN)[number];

export type CustomerType = "privat" | "gewerbe";

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  sparte: Sparte;
  stage: StageIndex;
  expectedCourtage: number;
  nextStep: string;
  nextStepAt?: string;
  phone?: string;
  email?: string;
  source?: string;
  projectId?: string | null;
  note?: string;
  createdAt: string;
  lastContactAt?: string;
  archived?: boolean;
}

export type ActivityType = "anruf" | "termin" | "mail" | "phase" | "notiz";

export interface Activity {
  id: string;
  customerId: string;
  type: ActivityType;
  text: string;
  at: string;
}

export interface AppEvent {
  id: string;
  customerId?: string | null;
  title: string;
  start: string;
  durationMin: number;
  place?: string;
}

export interface Task {
  id: string;
  customerId?: string | null;
  title: string;
  due: string;
  done: boolean;
}

export interface Project {
  id: string;
  name: string;
  sparten: Sparte[];
  start: string;
  end: string;
  goalDeals: number;
}

export interface Goal {
  month: string;
  courtage: number;
  deals: number;
  events: number;
  leads: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
