import { cache } from "./utils/cache";
import { ScheduleItem } from "./types";
import * as ICAL from "ical.js"; // ical.js を利用してICSをパース

// GoogleカレンダーはTODO（型と分岐のみ用意）
export type GoogleCredentials = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

function readTTL(): number {
  const v = Number(process.env.CACHE_TTL_SECONDS || 300);
  return Number.isFinite(v) && v > 0 ? v : 300;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

async function fetchIcsText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ICS fetch failed: ${res.status}`);
  return await res.text();
}

function normalizeFromIcal(icsText: string, dayStart: Date, dayEnd: Date): ScheduleItem[] {
  try {
    const jcal = ICAL.parse(icsText);
    const comp = new ICAL.Component(jcal);
    const vevents = comp.getAllSubcomponents("vevent");

    const items: ScheduleItem[] = [];

    for (const v of vevents) {
      try {
        const ev = new ICAL.Event(v);

        // 繰り返し予定は簡易対応：基本の予定＋必要ならDTEND重複チェック
        // ical.js の完全な反復展開は iterator を使うが、最小実装として
        // 当日の範囲と重なるものを抽出。
        const start = ev.startDate.toJSDate();
        const end = ev.endDate ? ev.endDate.toJSDate() : new Date(start.getTime());

        if (overlaps(start, end, dayStart, dayEnd)) {
          items.push({
            title: ev.summary || "(no title)",
            startISO: start.toISOString(),
            endISO: end.toISOString(),
            location: ev.location || undefined,
            allDay: ev.startDate.isDate || ev.endDate?.isDate || false,
          });
          continue;
        }

        // iterator による発生展開（当日のみ）- できる範囲の簡易対応
        if (ev.isRecurring()) {
          try {
            const it = ev.iterator();
            let next = it.next();
            // 無限ループ防止の簡易上限
            let guard = 0;
            while (next && guard++ < 500) {
              const occStart = next.toJSDate();
              const occ = ev.getOccurrenceDetails(next);
              const occEnd = occ.endDate.toJSDate();
              if (overlaps(occStart, occEnd, dayStart, dayEnd)) {
                items.push({
                  title: ev.summary || "(no title)",
                  startISO: occStart.toISOString(),
                  endISO: occEnd.toISOString(),
                  location: ev.location || undefined,
                  allDay: occ.startDate.isDate || occ.endDate.isDate || false,
                });
                break; // 当日の1回分が取れたら終了
              }
              // 当日を過ぎたら終了
              if (occStart > dayEnd) break;
              next = it.next();
            }
          } catch (e) {
            // 反復展開に失敗しても致命的ではない
            console.error("[ics] recurrence expand failed", e);
          }
        }
      } catch (e) {
        console.error("[ics] vevent parse failed", e);
      }
    }

    return items
      .sort((a, b) => (a.startISO < b.startISO ? -1 : 1));
  } catch (e) {
    console.error("[ics] parse error", e);
    return [];
  }
}

export async function getTodaySchedule({ force = false }: { force?: boolean } = {}): Promise<ScheduleItem[]> {
  const cacheKey = "schedule:today";
  const ttl = readTTL();
  if (!force) {
    const hit = cache.get<ScheduleItem[]>(cacheKey);
    if (hit) return hit;
  }

  const dayStart = startOfToday();
  const dayEnd = endOfToday();

  const googleCredJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const googleCalendarId = process.env.GOOGLE_CALENDAR_ID;
  const icsUrl = process.env.CALENDAR_ICS_URL;

  // Google優先（未実装のためICSへフォールバック）
  if (googleCredJson && googleCalendarId) {
    console.warn("[calendar] GoogleカレンダーはTODOのためICS/モックにフォールバックします");
  }

  let items: ScheduleItem[] = [];
  if (icsUrl) {
    try {
      const ics = await fetchIcsText(icsUrl);
      items = normalizeFromIcal(ics, dayStart, dayEnd);
    } catch (e) {
      console.error("[calendar] ICS fetch/parse failed", e);
    }
  }

  if (items.length === 0) {
    const { mockSchedule } = await import("./mock");
    items = mockSchedule;
  }

  cache.set(cacheKey, items, ttl);
  return items;
}

