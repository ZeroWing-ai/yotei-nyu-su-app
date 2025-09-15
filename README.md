# 予定+ニュース ダッシュボード（最小構成）

Vite + React + TypeScript（Tailwind v4）と Express（Node）で動く、シンプルな予定+ニュースダッシュボードです。設定が空でもモックで表示され、エラーで落ちないフェイルソフト設計です。

## 起動手順

```
npm install
cp .env.example .env   # 任意でRSS/ICS/Google情報を追記
npm run dev            # http://localhost:5173 でフロント、http://localhost:8787 がAPI
```

開発中は Vite の proxy によりフロントから `/api` へ接続します。`npm run start`（プレビュー）時は Vite の proxy が効かないため、クライアント側で自動的に `http://localhost:8787/api` を叩くようになっています。

## 機能概要

- 左：今日の予定（Google/ICS/モック。Google連携あり・予定追加対応）
- 右：ニュース（タブ切替：AI／経済／イケハヤのRSS）
- 未設定でもモック表示。部分失敗OK、全滅時もモックで返却。
- 「更新」ボタンで `force=true` 再取得。ローディングはスケルトン表示。

## 環境変数（.env）

```
# 予定（任意。両方空ならモックで返す）
GOOGLE_CREDENTIALS_JSON=   # JSON文字列（任意）
GOOGLE_CALENDAR_ID=        # primary など（任意）
CALENDAR_ICS_URL=          # 公開ICSのURL（任意）

# ニュースRSS（カンマ区切り）
AI_NEWS_FEEDS=https://example.com/ai.rss
ECONOMY_NEWS_FEEDS=https://example.com/economy.rss
IKEHAYA_NEWS_FEEDS=https://example.com/ikehaya.rss

# キャッシュ秒（任意）
CACHE_TTL_SECONDS=300
```

## 開発メモ

- クライアント: Vite(5173) + React + TypeScript + Tailwind v4（`@tailwindcss/postcss` + `autoprefixer`）
- サーバー: Express(8787) `/api/news`, `/api/schedule/today`, `POST /api/schedule`
- RSS: `rss-parser`、ICS: `ical.js`、Googleカレンダー（サービスアカウント）
- キャッシュ: サーバー内メモリにカテゴリ/種別ごとにTTL（デフォルト300秒）

### Googleカレンダー連携（Service Account想定）
1. Google Cloud でサービスアカウントを作成し、鍵（JSON）を発行。
2. 対象のカレンダーをサービスアカウントのメールアドレスに「共有」（閲覧/編集権限）。
3. `.env` に以下を設定：
   - `GOOGLE_CREDENTIALS_JSON` … サービスアカウントのJSON文字列（`client_email`/`private_key`を含む）
   - `GOOGLE_CALENDAR_ID` … 共有したカレンダーID（例: `primary` または カレンダーのID）
4. 以上で `/api/schedule/today` がGoogleから今日の予定を取得し、`POST /api/schedule` で予定追加が可能になります。
   - 未設定時はICS→モックへフォールバック、追加APIは501を返します。

## スクリプト

- `npm run dev` フロントとサーバーを同時起動（開発用）
- `npm run build` クライアントとサーバーを順にビルド
- `npm run start` サーバー起動 + クライアントを `vite preview` で配信

## ディレクトリ構成

```
client/  (Vite React)
server/  (Express API)
```

## 品質

- ESLint + Prettier（デフォルト設定）
- 例外は `console.error` に記録。UI はカード内メッセージで優しく通知。

## 既知の制限

- ICS の繰り返し予定の完全展開は簡易対応（一般的ケースで動作）。
