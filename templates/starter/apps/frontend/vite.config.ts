import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // React Compiler — useMemo · useCallback 을 손으로 넣지 않아도 다시 그리기를 줄인다. 끄려면 babel 옵션을 지운다
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
    tailwindcss()
  ],
  // /api 를 로컬 backend 로 넘긴다 — 브라우저는 같은 주소만 부르므로 CORS 설정이 필요 없다
  server: { port: 5173, strictPort: true, proxy: { "/api": { target: "http://127.0.0.1:3000", rewrite: (path) => path.replace(/^\/api/, "") } } },
  preview: { port: 4173 },
  resolve: { dedupe: ["react", "react-dom"] }
});
