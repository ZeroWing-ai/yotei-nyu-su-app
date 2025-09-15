import { NewsCategory, NewsItem, ScheduleItem } from "./types";

// ニュースのモックデータ（カテゴリごとに3件）
const now = Date.now();

export const mockNews: Record<NewsCategory, NewsItem[]> = {
  ai: [
    {
      title: "大規模言語モデル、推論高速化の新手法",
      link: "https://example.com/ai/1",
      source: "Example AI",
      isoDate: new Date(now - 5 * 60 * 1000).toISOString(),
      summary: "研究者らがLLMの高速化手法を発表。効率と精度の両立が可能に。",
    },
    {
      title: "生成AIを活用したUXの潮流",
      link: "https://example.com/ai/2",
      source: "Example AI",
      isoDate: new Date(now - 60 * 60 * 1000).toISOString(),
      summary: "プロトタイピングから運用まで、生成AIの活用が進む。",
    },
    {
      title: "画像生成モデルの評価ベンチマーク更新",
      link: "https://example.com/ai/3",
      source: "Example AI",
      isoDate: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      summary: "新ベンチマークでトップモデルの順位が入れ替わる。",
    },
  ],
  economy: [
    {
      title: "中央銀行、金利据え置きを発表",
      link: "https://example.com/economy/1",
      source: "Example Economy",
      isoDate: new Date(now - 10 * 60 * 1000).toISOString(),
      summary: "市場は予想通りの反応。為替は小幅な動きにとどまる。",
    },
    {
      title: "雇用統計、予想上回る伸び",
      link: "https://example.com/economy/2",
      source: "Example Economy",
      isoDate: new Date(now - 90 * 60 * 1000).toISOString(),
      summary: "堅調な雇用情勢が改めて確認された。",
    },
    {
      title: "原材料価格の高止まり続く",
      link: "https://example.com/economy/3",
      source: "Example Economy",
      isoDate: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      summary: "製造業のコスト圧力が長期化。価格転嫁が課題に。",
    },
  ],
  ikehaya: [
    {
      title: "イケハヤさん新記事: Web3の最新トレンド",
      link: "https://example.com/ikehaya/1",
      source: "Ikehaya Blog",
      isoDate: new Date(now - 15 * 60 * 1000).toISOString(),
      summary: "コミュニティ主導のプロジェクトが台頭。注目ポイントを解説。",
    },
    {
      title: "個人の発信力を高める方法",
      link: "https://example.com/ikehaya/2",
      source: "Ikehaya Blog",
      isoDate: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      summary: "継続と仕組み化で伸び続ける。実践的なコツを紹介。",
    },
    {
      title: "仮想通貨市場の見通し",
      link: "https://example.com/ikehaya/3",
      source: "Ikehaya Blog",
      isoDate: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      summary: "ボラティリティに備えた戦略。長期スタンスで考える。",
    },
  ],
};

// 予定のモック（3件）
export const mockSchedule: ScheduleItem[] = [
  {
    title: "朝会",
    startISO: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    endISO: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    location: "オンライン",
  },
  {
    title: "ランチMTG",
    startISO: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    endISO: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    location: "渋谷オフィス",
  },
  {
    title: "資料作成",
    startISO: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    endISO: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
    location: "自宅",
  },
];

