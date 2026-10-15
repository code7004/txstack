import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./tailwind.css";

/**
 * **주소 끝의 `/` 를 뗀다.** 배포본은 주소마다 폴더의 `index.html` 을 두어서(scripts/share-meta) 직접 들어오면
 * Pages 가 `/docs/start/` 로 돌려보낸다. 앱 안의 주소 · 메뉴 · 검색은 슬래시 없이 쓰므로 그리기 전에 맞춘다.
 */
const { pathname, search, hash } = window.location;
if (pathname.length > import.meta.env.BASE_URL.length && pathname.endsWith("/")) {
  window.history.replaceState(window.history.state, "", `${pathname.replace(/\/+$/, "")}${search}${hash}`);
}

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
