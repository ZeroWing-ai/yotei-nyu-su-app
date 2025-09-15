import React, { useMemo, useState } from "react";
import { apiBase } from "../lib/time";

type Props = {
  onCreated: () => void;
  onCancel: () => void;
};

export const AddScheduleForm: React.FC<Props> = ({ onCreated, onCancel }) => {
  const now = useMemo(() => new Date(), []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const toLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const defaultStart = useMemo(() => {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocal(d);
  }, [now]);
  const defaultEnd = useMemo(() => {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 2);
    return toLocal(d);
  }, [now]);

  const [title, setTitle] = useState("");
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [location, setLocation] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // datetime-local はローカル時刻のため、そのままDateに通しISO化
      const startISO = new Date(start).toISOString();
      const endISO = new Date(end).toISOString();
      const body = { title, startISO, endISO, location, allDay };
      const res = await fetch(`${apiBase()}/api/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      onCreated();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "追加に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-sm">
          タイトル
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="予定名"
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
          終日
        </label>
        <label className="text-sm">
          開始
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </label>
        <label className="text-sm">
          終了
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </label>
        <label className="sm:col-span-2 text-sm">
          場所（任意）
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="オンライン / 会議室 など"
          />
        </label>
      </div>
      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md border border-green-600 bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-soft hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:opacity-60"
        >
          追加
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};

