// クライアント側の時間ユーティリティ

const rtf = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });

export function toRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  const min = Math.round(sec / 60);
  const hour = Math.round(min / 60);
  const day = Math.round(hour / 24);

  if (sec < 60) return rtf.format(Math.sign(diffMs) * -sec, "second");
  if (min < 60) return rtf.format(Math.sign(diffMs) * -min, "minute");
  if (hour < 24) return rtf.format(Math.sign(diffMs) * -hour, "hour");
  return rtf.format(Math.sign(diffMs) * -day, "day");
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function formatTimeRange(startISO: string, endISO: string, allDay?: boolean): string {
  if (allDay) return "終日";
  const s = new Date(startISO);
  const e = new Date(endISO);
  const f = (d: Date) => d.toLocaleTimeString("ja-JP", { hour12: false, hour: "2-digit", minute: "2-digit" });
  return `${f(s)}〜${f(e)}`;
}

export function isNowBetween(startISO: string, endISO: string): boolean {
  const now = Date.now();
  return new Date(startISO).getTime() <= now && now <= new Date(endISO).getTime();
}

export function formatTodayHeader(date = new Date()): string {
  const w = "日月火水木金土"[date.getDay()];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${w}）`;
}

export function apiBase(): string {
  // 開発時は Vite proxy を使うため空。
  // プレビュー(start)時は proxy が無いので 8787 を直叩き。
  return import.meta.env.DEV ? "" : "http://localhost:8787";
}

