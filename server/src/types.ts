// サーバー側で使う共通型定義

export type NewsItem = {
  title: string;
  link: string;
  source: string; // フィードタイトル or ドメイン
  isoDate: string; // ISO8601文字列（降順ソート用）
  summary: string;
};

export type ScheduleItem = {
  title: string;
  startISO: string;
  endISO: string;
  location?: string;
  allDay?: boolean;
};

export type NewsCategory = "ai" | "economy" | "ikehaya";

