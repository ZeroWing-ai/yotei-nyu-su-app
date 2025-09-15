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
  const activeBg = (k: TabKey) =>
    k === "ai" ? "bg-blue-600" : k === "economy" ? "bg-green-600" : "bg-red-600";
  const activeText = "text-white";
  const inactiveText = "text-gray-700 dark:text-gray-200";
  const inactiveHover = (k: TabKey) =>
    k === "ai"
      ? "hover:text-blue-700"
      : k === "economy"
      ? "hover:text-green-700"
      : "hover:text-red-700";

  return (
    <div className="flex gap-1 rounded-lg bg-brand-50 p-1 text-sm dark:bg-gray-700">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={
              "flex-1 rounded-md px-3 py-1 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 " +
              (active
                ? `${activeBg(t.key)} ${activeText} shadow-soft`
                : `${inactiveText} ${inactiveHover(t.key)} hover:bg-white`)
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
