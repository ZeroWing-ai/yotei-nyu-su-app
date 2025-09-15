import { cache } from "./utils/cache";
import { ScheduleItem, CreateScheduleRequest } from "./types";
import * as ICAL from "ical.js"; // ical.js を利用してICSをパース
import { google } from "googleapis";

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

  // Google優先
  if (googleCredJson && googleCalendarId) {
    try {
      const items = await fetchGoogleEventsForToday(googleCredJson, googleCalendarId, dayStart, dayEnd);
      if (items.length > 0) {
        cache.set(cacheKey, items, ttl);
        return items;
      }
    } catch (e) {
      console.error("[calendar] Google fetch failed", e);
    }
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

// ---- Google Calendar（Service Account 前提） ----
function makeJWT(credJson: string) {
  const cred = JSON.parse(credJson);
  const client_email = cred.client_email;
  const private_key = cred.private_key;
  if (!client_email || !private_key) throw new Error("Invalid GOOGLE_CREDENTIALS_JSON");
  return new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    subject: cred.subject || undefined, // 必要なら委任先ユーザーを指定
  });
}

async function fetchGoogleEventsForToday(
  credJson: string,
  calendarId: string,
  dayStart: Date,
  dayEnd: Date
): Promise<ScheduleItem[]> {
  const auth = makeJWT(credJson);
  const calendar = google.calendar({ version: "v3", auth });
  const timeMin = dayStart.toISOString();
  const timeMax = dayEnd.toISOString();
  const resp = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });
  const items = (resp.data.items || []).map((e) => {
    const startISO = e.start?.dateTime || (e.start?.date ? new Date(e.start.date).toISOString() : "");
    const endISO = e.end?.dateTime || (e.end?.date ? new Date(e.end.date).toISOString() : "");
    return {
      title: e.summary || "(no title)",
      startISO,
      endISO,
      location: e.location || undefined,
      allDay: Boolean(e.start?.date),
    } as ScheduleItem;
  });
  return items;
}

export async function createScheduleEvent(body: CreateScheduleRequest): Promise<ScheduleItem> {
  const googleCredJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const googleCalendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!(googleCredJson && googleCalendarId)) {
    throw Object.assign(new Error("Googleカレンダー未設定のため追加できません"), { status: 501 });
  }

  if (!body?.title || !body?.startISO || !body?.endISO) {
    throw Object.assign(new Error("title/startISO/endISO は必須です"), { status: 400 });
  }

  const auth = makeJWT(googleCredJson);
  const calendar = google.calendar({ version: "v3", auth });

  const resource: any = {
    summary: body.title,
    location: body.location || undefined,
  };
  if (body.allDay) {
    // allDay は date を使用（end は翌日の date を指定するのがGoogle流儀）
    const startDate = new Date(body.startISO);
    const endDate = new Date(body.endISO);
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
    resource.start = { date: toDateStr(startDate) };
    resource.end = { date: toDateStr(endDate) };
  } else {
    resource.start = { dateTime: body.startISO };
    resource.end = { dateTime: body.endISO };
  }

  const resp = await calendar.events.insert({ calendarId: googleCalendarId, requestBody: resource });
  const ev = resp.data;
  return {
    title: ev.summary || body.title,
    startISO: ev.start?.dateTime || (ev.start?.date ? new Date(ev.start.date).toISOString() : body.startISO),
    endISO: ev.end?.dateTime || (ev.end?.date ? new Date(ev.end.date).toISOString() : body.endISO),
    location: ev.location || body.location,
    allDay: Boolean(ev.start?.date),
  };
}
