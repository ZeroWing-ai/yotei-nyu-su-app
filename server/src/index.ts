import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { getNews } from "./rss";
import { getTodaySchedule, createScheduleEvent } from "./calendar";
import { NewsCategory } from "./types";

// .env をプロジェクトルート優先で読み込み（次に server/.env）
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ニュース: /api/news?category=ai|economy|ikehaya&force=true|false
app.get("/api/news", async (req, res) => {
  const category = String(req.query.category || "ai") as NewsCategory;
  const force = String(req.query.force || "false") === "true";

  if (!(["ai", "economy", "ikehaya"] as NewsCategory[]).includes(category)) {
    return res.status(400).json({ error: "invalid category" });
  }

  try {
    const items = await getNews(category, { force });
    res.json(items);
  } catch (e) {
    console.error("/api/news failed", e);
    // フェイルソフト: モックで返す
    const { mockNews } = await import("./mock");
    res.json(mockNews[category]);
  }
});

// 予定: /api/schedule/today?force=true|false
app.get("/api/schedule/today", async (req, res) => {
  const force = String(req.query.force || "false") === "true";
  try {
    const items = await getTodaySchedule({ force });
    res.json(items);
  } catch (e) {
    console.error("/api/schedule/today failed", e);
    const { mockSchedule } = await import("./mock");
    res.json(mockSchedule);
  }
});

// 予定追加: Googleカレンダー設定時のみ
app.post("/api/schedule", async (req, res) => {
  try {
    const created = await createScheduleEvent(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    console.error("/api/schedule (create) failed", e);
    const status = e?.status || 500;
    res.status(status).json({ error: e?.message || "failed to create event" });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
