import React from "react";
import { toRelativeTime } from "../lib/time";
import type { TabKey } from "./Tabs";

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  isoDate: string;
  summary: string;
};

type Props = {
  items: NewsItem[];
  loading: boolean;
  error?: string | null;
  tone?: TabKey; // カテゴリに応じた色付け
};

export const NewsList: React.FC<Props> = ({ items, loading, tone = "ai" }) => {
  if (loading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-3 w-5/6" />
          </li>
        ))}
      </ul>
    );
  }

  const toneTitle =
    tone === "ai"
      ? "text-blue-700 hover:text-blue-600 dark:text-blue-400"
      : tone === "economy"
      ? "text-green-700 hover:text-green-600 dark:text-green-400"
      : "text-red-700 hover:text-red-600 dark:text-red-400";
  const tonePill =
    tone === "ai"
      ? "bg-blue-50 text-blue-700"
      : tone === "economy"
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700";

  return (
    <ul className="space-y-4">
      {items.map((n) => (
        <li key={n.link} className="group">
          <a
            className={`text-base font-semibold underline-offset-2 hover:underline ${toneTitle}`}
            href={n.link}
            target="_blank"
            rel="noreferrer"
          >
            {n.title}
          </a>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className={`rounded-full px-2 py-0.5 font-medium ${tonePill}`}>
              {n.source}
            </span>
            <span className="text-gray-400">{toRelativeTime(n.isoDate)}</span>
          </div>
          {n.summary && (
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 line-clamp-3">
              {n.summary}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};
