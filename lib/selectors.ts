import type { Customer, AppEvent, Task, Project } from "./types";
import { BASE_COURTAGE, BASE_DEALS } from "./seed";
import { dateKey, startOfISOWeek, addDays } from "./format";

export const customerById = (customers: Customer[], id?: string | null) =>
  customers.find((c) => c.id === id) || null;

export const openCustomers = (customers: Customer[]) =>
  customers.filter((c) => c.stage < 5);

export const wonCustomers = (customers: Customer[]) =>
  customers.filter((c) => c.stage === 5);

export const courtageInMonth = (customers: Customer[]) =>
  BASE_COURTAGE +
  wonCustomers(customers).reduce((a, c) => a + c.expectedCourtage, 0);

export const dealsInMonth = (customers: Customer[]) =>
  BASE_DEALS + wonCustomers(customers).length;

export const pipelinePotential = (customers: Customer[]) =>
  openCustomers(customers).reduce((a, c) => a + c.expectedCourtage, 0);

export const eventsOnDay = (events: AppEvent[], dateIso: string) =>
  events
    .filter((e) => dateKey(e.start) === dateIso)
    .sort((a, b) => a.start.localeCompare(b.start));

export const eventsThisWeek = (events: AppEvent[], today: string) => {
  const start = startOfISOWeek(today);
  const end = addDays(start, 7);
  return events.filter((e) => {
    const k = dateKey(e.start);
    return k >= start && k < end;
  });
};

export const openTasks = (tasks: Task[]) => tasks.filter((t) => !t.done);

export const projectStats = (
  project: Project,
  customers: Customer[]
) => {
  const members = customers.filter((c) => c.projectId === project.id);
  const leads = members.length;
  const won = members.filter((c) => c.stage === 5).length;
  const rate = leads === 0 ? 0 : Math.round((won / leads) * 100);
  return { members, leads, won, rate };
};

export const daysLeftInMonth = (todayIso: string) => {
  const d = new Date(todayIso);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return last - d.getDate();
};
