// Tailwind 를 먼저 — 레이어 순서는 처음 나온 순서로 정해진다
import "./styles/tailwind.css";
import "./styles/txstack.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
