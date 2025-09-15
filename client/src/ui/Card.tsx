import React from "react";

type Props = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  error?: string | null;
};

export const Card: React.FC<Props> = ({ title, action, children, error }) => {
  return (
    <div className="rounded-xl2 border border-gray-200 bg-white shadow-card dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-brand-100 bg-gradient-to-r from-brand-50 to-accent-50 px-4 py-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
        <h2 className="text-base font-semibold text-brand-700 dark:text-white">{title}</h2>
        {action}
      </div>
      <div className="p-4">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
