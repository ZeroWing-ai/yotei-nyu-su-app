import React from "react";
import { toRelativeTime } from "../lib/time";

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
};

export const NewsList: React.FC<Props> = ({ items, loading }) => {
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

  return (
    <ul className="space-y-4">
      {items.map((n) => (
        <li key={n.link} className="group">
          <a
            className="text-base font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
            href={n.link}
            target="_blank"
            rel="noreferrer"
          >
            {n.title}
          </a>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{n.source}</span>
            <span className="px-1">•</span>
            <span>{toRelativeTime(n.isoDate)}</span>
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

