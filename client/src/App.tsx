import React, { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/Card";
import { Tabs, TabKey } from "./ui/Tabs";
import { NewsList, NewsItem } from "./ui/NewsList";
import { ScheduleList, ScheduleItem } from "./ui/ScheduleList";
import { apiBase, formatTodayHeader } from "./lib/time";

type FetchState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

const initialNews: FetchState<NewsItem[]> = { data: [], loading: true, error: null };
const initialSchedule: FetchState<ScheduleItem[]> = { data: [], loading: true, error: null };

export const App: React.FC = () => {
  const [tab, setTab] = useState<TabKey>("ai");
  const [news, setNews] = useState<Record<TabKey, FetchState<NewsItem[]>>>(
    () => ({ ai: { ...initialNews }, economy: { ...initialNews }, ikehaya: { ...initialNews } })
  );
  const [schedule, setSchedule] = useState<FetchState<ScheduleItem[]>>({ ...initialSchedule });
  const [refreshing, setRefreshing] = useState(false);

  const todayLabel = useMemo(() => formatTodayHeader(new Date()), []);

  async function loadNews(cat: TabKey, force = false) {
    setNews((s) => ({ ...s, [cat]: { ...s[cat], loading: true, error: null } }));
    try {
      const res = await fetch(`${apiBase()}/api/news?category=${cat}&force=${force}`);
      const json = await res.json();
      setNews((s) => ({ ...s, [cat]: { data: json, loading: false, error: null } }));
    } catch (e) {
      console.error(e);
      setNews((s) => ({ ...s, [cat]: { data: s[cat].data, loading: false, error: "ニュースの取得に失敗しました" } }));
    }
  }

  async function loadSchedule(force = false) {
    setSchedule((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${apiBase()}/api/schedule/today?force=${force}`);
      const json = await res.json();
      setSchedule({ data: json, loading: false, error: null });
    } catch (e) {
      console.error(e);
      setSchedule((s) => ({ ...s, loading: false, error: "予定の取得に失敗しました" }));
    }
  }

  useEffect(() => {
    loadSchedule(false);
    // 3カテゴリを並列でプリフェッチ
    void Promise.all([loadNews("ai", false), loadNews("economy", false), loadNews("ikehaya", false)]);
  }, []);

  useEffect(() => {
    if (!news[tab].data.length && !news[tab].loading) {
      void loadNews(tab, false);
    }
  }, [tab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadSchedule(true), loadNews(tab, true)]);
    setRefreshing(false);
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      {/* ヘッダー */}
      <header className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-xl font-extrabold text-transparent">
          {todayLabel}
        </h1>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md border border-brand-600 bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:opacity-60"
        >
          {refreshing ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
          ) : (
            <span className="inline-block h-4 w-4">🔄</span>
          )}
          更新
        </button>
      </header>

      {/* レイアウト：モバイル縦、PCは左右 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 左：今日の予定 */}
        <Card title="今日の予定" error={schedule.error || null}>
          <ScheduleList items={schedule.data} loading={schedule.loading} />
        </Card>

        {/* 右：ニュース（タブ切替） */}
        <Card
          title="ニュース"
          action={<Tabs value={tab} onChange={(k) => setTab(k)} />}
          error={news[tab].error || null}
        >
          <NewsList items={news[tab].data} loading={news[tab].loading} tone={tab} />
        </Card>
      </div>

      {/* モバイル時の縦並びでも、AI→経済→イケハヤの順番に自然に見える配置 */}
      <div className="mt-4 space-y-4 md:hidden">
        {(["ai", "economy", "ikehaya"] as TabKey[])
          .filter((k) => k !== tab)
          .map((k) => (
            <Card key={k} title={`ニュース：${k.toUpperCase()}`} error={news[k].error || null}
              action={
                <button
                  onClick={() => loadNews(k, true)}
                  className={
                    "rounded-md px-2 py-1 text-xs font-semibold text-white shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-400 " +
                    (k === "ai"
                      ? "bg-blue-600 hover:bg-blue-700 border border-blue-600"
                      : k === "economy"
                      ? "bg-green-600 hover:bg-green-700 border border-green-600"
                      : "bg-red-600 hover:bg-red-700 border border-red-600")
                  }
                >
                  再取得
                </button>
              }
            >
              <NewsList items={news[k].data} loading={news[k].loading} tone={k} />
            </Card>
          ))}
      </div>
    </div>
  );
};
