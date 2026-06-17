import { isBefore, parseISO } from "date-fns";

export function computeMetrics(rkmId: string, tasks: any[], today = new Date()) {
  const t = tasks.filter((x) => x.rkm_id === rkmId);
  const total = t.length;
  const done = t.filter((x) => x.status === "Done").length;

  const actual = total === 0 ? 0 : done / total;

  const expectedDone = t.filter((x) => {
    if (!x.plan_finish) return false;
    const d = parseISO(x.plan_finish);
    return d <= today;
  }).length;

  const expected = total === 0 ? 0 : expectedDone / total;

  const overdue = t.filter((x) => {
    if (!x.plan_finish) return false;
    const d = parseISO(x.plan_finish);
    return isBefore(d, today) && x.status !== "Done";
  }).length;

  const gap = actual - expected;
  const behind = gap < -0.1 || overdue > 0;

  return { total, done, actual, expected, gap, overdue, behind };
}