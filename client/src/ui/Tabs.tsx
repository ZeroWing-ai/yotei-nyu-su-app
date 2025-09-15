import React from "react";

export type TabKey = "ai" | "economy" | "ikehaya";

type Props = {
  value: TabKey;
  onChange: (v: TabKey) => void;
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "ai", label: "AI" },
  { key: "economy", label: "ECONOMY" },
  { key: "ikehaya", label: "IKEHAYA" },
];

export const Tabs: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex gap-1 rounded-lg bg-brand-50 p-1 text-sm dark:bg-gray-700">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={
              "flex-1 rounded-md px-3 py-1 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300 " +
              (active
                ? "bg-brand-600 text-white shadow-soft dark:bg-brand-600"
                : "text-brand-700 hover:bg-white hover:text-brand-700 dark:text-gray-200 dark:hover:text-white")
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
