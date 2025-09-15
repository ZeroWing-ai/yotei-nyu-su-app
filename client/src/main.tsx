import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";

// darkMode: 'class' に合わせて、OS設定に応じて 'dark' クラスを自動付与
const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
const applyDarkClass = () => {
  const isDark = mql ? mql.matches : false;
  document.documentElement.classList.toggle('dark', isDark);
};
applyDarkClass();
try {
  mql?.addEventListener('change', applyDarkClass);
} catch {
  // 古いブラウザ用のfallback（必須ではないので無視）
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
