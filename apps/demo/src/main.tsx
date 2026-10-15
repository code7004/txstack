import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { API_URL, api } from "./lib/api";
import { mockAdapter } from "./mock/server";
import "./index.css";

// 서버 주소(VITE_API_URL)가 없으면 가짜 서버로 답합니다. 실제 서버를 쓰면 이 줄은 아무 일도 하지 않습니다
if (!API_URL) api.setConfig({ adapter: mockAdapter });

// 표(TxAgGrid)가 쓰는 ag-grid 모듈. 앱에서 한 번 등록합니다
ModuleRegistry.registerModules([AllCommunityModule]);

const queryClient = new QueryClient({
  defaultOptions: {
    // 가짜 서버는 일부러 실패(409 · 403)를 돌려줍니다. 같은 요청을 다시 보내도 같은 답이라 재시도하지 않습니다
    queries: { retry: false, refetchOnWindowFocus: false }
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
