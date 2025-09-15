import React from "react";
import { formatTimeRange, isNowBetween } from "../lib/time";

export type ScheduleItem = {
  title: string;
  startISO: string;
  endISO: string;
  location?: string;
  allDay?: boolean;
};

type Props = {
  items: ScheduleItem[];
  loading: boolean;
};

export const ScheduleList: React.FC<Props> = ({ items, loading }) => {
  if (loading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="space-y-2">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
          </li>
        ))}
      </ul>
    );
  }

  if (!items || items.length === 0) {
    return <div className="text-sm text-gray-500">今日は予定なし</div>;
  }

  return (
    <ul className="space-y-3">
      {items.map((ev) => {
        const now = isNowBetween(ev.startISO, ev.endISO);
        return (
          <li
            key={`${ev.title}-${ev.startISO}`}
            className={
              "rounded-lg border p-3 dark:border-gray-700 " +
              (now
                ? "border-green-600 bg-green-50 pl-3.5 ring-1 ring-green-100 dark:bg-gray-900"
                : "bg-white dark:bg-gray-800")
            }
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {formatTimeRange(ev.startISO, ev.endISO, ev.allDay)}
              </div>
              {ev.location && (
                <div className="rounded bg-accent-400/10 px-2 py-0.5 text-xs font-medium text-accent-500">
                  {ev.location}
                </div>
              )}
            </div>
            <div className="mt-0.5 text-base font-semibold text-green-700 dark:text-green-400">
              {ev.title}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
