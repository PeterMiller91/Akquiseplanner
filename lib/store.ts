"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Customer,
  AppEvent,
  Task,
  Project,
  Goal,
  Activity,
  StageIndex,
} from "./types";
import {
  SEED_CUSTOMERS,
  SEED_EVENTS,
  SEED_TASKS,
  SEED_PROJECTS,
  SEED_GOAL,
  SEED_ACTIVITIES,
  TODAY_ISO,
} from "./seed";
import { STAGES } from "./types";
import { getUserData, setUserData } from "./user-store";

type State = {
  customers: Customer[];
  events: AppEvent[];
  tasks: Task[];
  projects: Project[];
  activities: Activity[];
  goal: Goal;
  today: string;
};

type Actions = {
  advanceStage: (customerId: string) => void;
  setStage: (customerId: string, stage: StageIndex) => void;
  toggleTask: (taskId: string) => void;
  setGoal: (updates: Partial<Goal>) => void;
  addCustomer: (data: Omit<Customer, "id" | "createdAt">) => void;
  deleteCustomer: (id: string) => void;
  archiveCustomer: (id: string) => void;
  resetToSeed: () => void;
};

const seedState = (): State => ({
  customers: [],
  events: structuredClone(SEED_EVENTS),
  tasks: structuredClone(SEED_TASKS),
  projects: structuredClone(SEED_PROJECTS),
  activities: structuredClone(SEED_ACTIVITIES),
  goal: structuredClone(SEED_GOAL),
  today: TODAY_ISO,
});

function createUserAwareStorage() {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      if (typeof window === "undefined") return null;
      const userId = localStorage.getItem("__auth_user_id__");
      if (!userId) return localStorage.getItem(name);
      return localStorage.getItem(`${userId}:${name}`);
    },
    setItem: (name: string, value: string) => {
      if (typeof window === "undefined") return;
      const userId = localStorage.getItem("__auth_user_id__");
      if (!userId) {
        localStorage.setItem(name, value);
      } else {
        localStorage.setItem(`${userId}:${name}`, value);
      }
    },
    removeItem: (name: string) => {
      if (typeof window === "undefined") return;
      const userId = localStorage.getItem("__auth_user_id__");
      if (!userId) {
        localStorage.removeItem(name);
      } else {
        localStorage.removeItem(`${userId}:${name}`);
      }
    },
  }));
}

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...seedState(),
      advanceStage: (customerId) =>
        set((st) => {
          const c = st.customers.find((x) => x.id === customerId);
          if (!c) return st;
          const next = Math.min(5, c.stage + 1) as StageIndex;
          if (next === c.stage) return st;
          const now = new Date().toISOString();
          const activity: Activity = {
            id: "a_" + Math.random().toString(36).slice(2, 9),
            customerId,
            type: "phase",
            text: `Phase: ${STAGES[next]}`,
            at: now,
          };
          return {
            customers: st.customers.map((x) =>
              x.id === customerId ? { ...x, stage: next, lastContactAt: now } : x
            ),
            activities: [activity, ...st.activities],
          };
        }),
      setStage: (customerId, stage) =>
        set((st) => ({
          customers: st.customers.map((x) =>
            x.id === customerId ? { ...x, stage } : x
          ),
        })),
      toggleTask: (taskId) =>
        set((st) => ({
          tasks: st.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        })),
      setGoal: (updates) =>
        set((st) => ({ goal: { ...st.goal, ...updates } })),
      addCustomer: (data) =>
        set((st) => ({
          customers: [
            {
              ...data,
              id: "c_" + Math.random().toString(36).slice(2, 9),
              createdAt: new Date().toISOString(),
            },
            ...st.customers,
          ],
        })),
      deleteCustomer: (id) =>
        set((st) => ({ customers: st.customers.filter((c) => c.id !== id) })),
      archiveCustomer: (id) =>
        set((st) => ({
          customers: st.customers.map((c) =>
            c.id === id ? { ...c, archived: true } : c
          ),
        })),
      resetToSeed: () => set(() => seedState()),
    }),
    {
      name: "ds-akquise-planer",
      storage: createUserAwareStorage(),
      version: 1,
      skipHydration: true,
    }
  )
);

