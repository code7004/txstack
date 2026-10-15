import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * txstack 으로 만든 작은 운영 관리 앱. 패키지는 **빌드된 결과(`dist`)** 를 씁니다 —
 * npm 에서 받은 것과 같은 모양이라, 이 앱이 돌면 소비자 앱에서도 돕니다.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    /**
     * 모노레포 안에서 돌릴 때만 필요합니다. 패키지가 workspace 링크라 그 안의 `react` 를
     * 패키지 쪽 node_modules 에서 찾으면 사본이 둘이 됩니다. 저장소 밖으로 가져가면 지워도 됩니다.
     */
    dedupe: ["react", "react-dom", "react-router-dom", "ag-grid-community", "ag-grid-react", "react-day-picker"]
  }
});
