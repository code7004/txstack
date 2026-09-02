import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./tailwind.css";

/**
 * **`BrowserRouter` 다.** 카탈로그의 레시피는 `MemoryRouter` 로 돌지만 여기서는 주소창을
 * 실제로 쓴다 — 새로고침 · 딥링크 · 뒤로가기가 그대로 걸린다. `route-meta` 를 이 자리에서
 * 검증하는 것이 이 앱의 목적 중 하나다.
 *
 * 하위 경로에 배포하면(GitHub Pages) `basename` 이 필요하다. Vite 가 넣어 주는 값을 쓴다.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
