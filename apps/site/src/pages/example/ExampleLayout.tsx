import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

/**
 * `/example` 묶음의 껍데기. **실제 앱이라면 진입점(`main.tsx`)에서 한 번 감싸는 자리**다.
 *
 * 클라이언트를 묶음 하나가 함께 쓰므로 캐시도 함께다 — `Error Logs` 에서 상태를 바꾸면
 * 같은 키를 무효화하므로 `Dashboard` 의 숫자도 따라 바뀐다.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    // 예제의 가짜 서버는 일부러 실패를 돌려준다(409 · 403). 같은 요청을 다시 보내 봐야 같은 답이다
    queries: { retry: false, refetchOnWindowFocus: false }
  }
});

export function ExampleLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
