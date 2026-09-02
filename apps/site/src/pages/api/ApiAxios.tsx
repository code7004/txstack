import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";

export function ApiAxios() {
  return (
    <Page title="@txstack/axios" lead="정책 주입식 HTTP 클라이언트. 토큰 · 401 처리 · 응답 봉투를 라이브러리가 정하지 않는다.">
      <Block title="React 를 쓰지 않는다">
        <p className="text-slate-600 dark:text-slate-300">
          이 패키지만 React 의존이 없다. <strong>Node 스크립트 · 워커 · 테스트에서도 같은 클라이언트를 쓴다.</strong> peer 는 <code>axios</code> 하나다.
        </p>

        <CodeBlock title="import">{`import { createHttpClient, parseApiError } from "@txstack/axios";`}</CodeBlock>
      </Block>

      <Block title="만들기">
        <CodeBlock title="lib/api.ts">{`export const api = createHttpClient({
  baseURL: "/api",
  timeout: 10_000,

  // 인증 — 토큰을 어디에 두는지는 앱이 안다
  getToken: () => localStorage.getItem("access-token"),
  authHeader: "Authorization",   // 기본
  authScheme: "Bearer",          // 기본. 빈 문자열이면 토큰만 넣는다

  // 401 을 만나면 무엇을 할지도 앱이 정한다
  onUnauthorized: () => logout(),
  onError: (error) => report(error),

  // 응답 봉투 해제 — { body: T } 라면
  unwrap: (data) => (data as { body: unknown }).body,

  // 로그를 콘솔이 아닌 곳으로
  onRequest: (log) => trace("→", log.method, log.url),
  onResponse: (log) => trace("←", log.status, log.durationMs + "ms"),
  maskFields: ["password", "accessToken"]
});`}</CodeBlock>

        <TxAlert variant="warning" title="Content-Type 을 고정하지 않는다">
          <code>headers</code> 에 <code>Content-Type</code> 을 박아 두면 파일 업로드에서 boundary 가 빠져 서버가 본문을 못 읽는다. axios 가 본문 종류를 보고 알아서 정하게 둔다.
        </TxAlert>
      </Block>

      <Block title="쓰기">
        <CodeBlock title="요청">{`const user = await api.get<User>("/users/1");
const list = await api.get<Page<User>>("/users", { page: 2, size: 20 });   // 두 번째가 query

await api.post<User>("/users", { name: "홍길동" });
await api.patch<User>("/users/1", { name: "김하늘" });

// DELETE 는 query 와 body 를 함께 쓰는 API 가 있다
await api.delete<void>("/users/1", { params: { force: true } });

// 봉투를 거치지 않는 원본 — 파일·CSV
const blob = await api.getBlob("/reports/2026.xlsx");
const csv = await api.getText("/reports/2026.csv");`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          이 래퍼가 못 하는 일이 생기면 <code>api.instance</code> 로 원본 axios 를 그대로 쓴다 — 감싸 두고 길을 막지 않는다.
        </p>
      </Block>

      <Block title="에러는 한 형태로">
        <CodeBlock title="parseApiError">{`try {
  await api.post("/users", body);
} catch (error) {
  const { statusCode, message } = parseApiError(error);
  // 네트워크 끊김 · 시간 초과 · 서버가 준 본문 — 전부 같은 형태로 온다
  TxToast.show({ variant: "danger", title: message });
}`}</CodeBlock>

        <TxAlert variant="info" title="이 사이트가 쓰고 있다">
          <strong>Example</strong> 의 GitHub 검색이 이 클라이언트로 돈다. 분당 10회를 넘기면 403 이 오는데, 그 응답도 <code>parseApiError</code> 를 거쳐 한 줄로 뜬다.
        </TxAlert>
      </Block>

      <Block title="그 밖에 내보내는 것">
        <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
          <p>
            <code>attachInterceptors</code> — 이미 만들어 둔 axios 인스턴스에 같은 정책만 붙인다.
          </p>
          <p>
            <code>isTokenExpired</code> — JWT 의 <code>exp</code> 를 본다. 갱신 시점을 앱이 정할 때 쓴다.
          </p>
          <p>
            <code>removeUndefined</code> — 쿼리에서 <code>undefined</code> 필드를 걷어낸다.
          </p>
        </div>
      </Block>
    </Page>
  );
}
